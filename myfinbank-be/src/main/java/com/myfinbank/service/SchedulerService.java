package com.myfinbank.service;

import com.myfinbank.dto.TransazioneDto;
import com.myfinbank.dto.finanziamento.RateDto;
import com.myfinbank.entity.Conto;
import com.myfinbank.entity.Finanziamento;
import com.myfinbank.entity.RateCalcolate;
import com.myfinbank.entity.Transazione;
import com.myfinbank.repository.ContoRepository;
import com.myfinbank.repository.FinanziamentoRepository;
import com.myfinbank.repository.RateCalcolateRepository;
import com.myfinbank.repository.TransazioneRepository;
import com.myfinbank.utils.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SchedulerService {

    private static final Logger log = LoggerFactory.getLogger(SchedulerService.class);

    private final ContoRepository contoRepository;
    private final TransazioneRepository transazioneRepository;
    private final FinanziamentoRepository finanziamentoRepository;
    private final FinanziamentoService finanziamentoService;
    private final RateCalcolateRepository rateCalcolateRepository;
    private final TransazioneService transazioneService;
    private final MarketDataService marketDataService;


    /**
     * Aggiorna i conti ogni 5 minuti e 10 secondi
     */
    @Scheduled(cron = "0 */20 * * * *")
    @Transactional
    public void aggiornaConti() {
        log.info("[ContoScheduler] Avvio aggiornamento conti");

        List<Conto> conti = contoRepository.findAll();
        if (conti.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now();
        List<Conto> contiAggiornati = new ArrayList<>();

        for (Conto conto : conti) {
            if (conto.getDataChiusura() != null) continue; // skip conti chiusi

            boolean changed = false;

            if (conto.getSaldoContabile() == null) {
                conto.setSaldoContabile(BigDecimal.ZERO);
                changed = true;
            }

            if (conto.getSaldoDisponibile() == null) {
                conto.setSaldoDisponibile(BigDecimal.ZERO);
                changed = true;
            }

            if (conto.getSaldoContabile().compareTo(conto.getSaldoDisponibile()) != 0) {
                conto.setSaldoContabile(conto.getSaldoDisponibile());
                changed = true;
            }

            if (changed) {
                conto.setUltimoAggiornamento(now);
                contiAggiornati.add(conto);
            }
        }

        if (!contiAggiornati.isEmpty()) {
            contoRepository.saveAll(contiAggiornati);
        }

        log.info("[ContoScheduler] Aggiornamento completato. Conti aggiornati: {}", contiAggiornati.size());
    }

    /**
     * Ogni 5 minuti contabilizza le transazioni IN_ATTESA da oltre 5 minuti
     */
    @Scheduled(cron = "0 */10 * * * *")
    @Transactional
    public void contabilizzaTransazioni() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(5);
        List<Transazione> transazioniDaContabilizzare =
                transazioneRepository.findTransazioniInAttesaOlderThan(threshold);

        log.info("[Scheduler] Trovate {} transazioni da contabilizzare", transazioniDaContabilizzare.size());

        for (Transazione tx : transazioniDaContabilizzare) {
            try {
                contabilizza(tx);
            } catch (Exception e) {
                log.error("[Scheduler] Errore contabilizzando transazione {}: {}", tx.getId(), e.getMessage());
            }
        }

        log.info("[Scheduler] Contabilizzazione completata");
    }

    private void contabilizza(Transazione tx) {
        Conto conto = tx.getConto();
        if (conto == null) {
            log.warn("[Scheduler] Transazione {} senza conto associato, salto.", tx.getId());
            return;
        }

        BigDecimal importo = tx.getImporto() != null ? tx.getImporto() : BigDecimal.ZERO;
        BigDecimal saldoDisponibile = conto.getSaldoDisponibile() != null ? conto.getSaldoDisponibile() : BigDecimal.ZERO;

        // Logica base di direzione transazione
        if ("USCITA".equalsIgnoreCase(tx.getDirezione())) {
            saldoDisponibile = saldoDisponibile.subtract(importo);
        } else if ("ENTRATA".equalsIgnoreCase(tx.getDirezione())) {
            saldoDisponibile = saldoDisponibile.add(importo);
        }

        conto.setSaldoDisponibile(saldoDisponibile);
        conto.setSaldoContabile(saldoDisponibile);
        conto.setUltimoAggiornamento(LocalDateTime.now());
        contoRepository.save(conto);

        tx.setStato("CONTABILIZZATO");
        tx.setDataContabile(LocalDateTime.now());
        transazioneRepository.save(tx);

        log.info("[Scheduler] Transazione {} contabilizzata su conto {}. Saldo aggiornato: {} €",
                tx.getId(), conto.getId(), saldoDisponibile);
    }

    /**
     * Aggiorna lo stato dei finanziamenti ogni 5 mininuti
     */
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void aggiornaStatoFinanziamenti() {
        log.info("[FinanziamentoScheduler] Avvio aggiornamento stato finanziamenti...");

        List<Finanziamento> finInAttesa = finanziamentoRepository
                .findByStato(StatoFinanziamento.IN_ATTESA_DI_APPROVAZIONE.name());
        LocalDateTime now = LocalDateTime.now();

        int approvati = 0;
        for (Finanziamento fin : finInAttesa) {
            if (fin.getDataCreazione().plusMinutes(5).isBefore(now)) {
                List<Conto> sorgente = contoRepository.findByUser(fin.getUser());
                for(Conto conto : sorgente) {
                    // 3️⃣ Creazione transazione iniziale (accredito finanziamento)
                    TransazioneDto tDto = new TransazioneDto();
                    tDto.setNumeroConto(conto.getNumeroConto());
                    tDto.setTipoTransazione(TipoTransazione.DEPOSITO.name());
                    tDto.setImporto(fin.getImportoRichiesto());
                    tDto.setValuta("EUR");
                    tDto.setDescrizione("Accredito importo finanziato pratica n. " + fin.getNumeroPratica());
                    tDto.setCategoria("FINANZIAMENTO");
                    transazioneService.creaTransazione(tDto);

                    log.info("Registrata transazione di accredito iniziale per finanziamento {} sul conto {}", fin.getNumeroPratica(), conto.getNumeroConto());

                    // 4️⃣ Calcola e salva tutte le rate
                    List<RateDto> rate = finanziamentoService.calcolaRata(fin.getNumeroPratica());
                    log.info("Generate {} rate per finanziamento {}", rate.size(), fin.getNumeroPratica());

                    log.info("Finanziamento {} approvato: conto {}, transazione {}, rate generate",
                            fin.getNumeroPratica(), conto.getNumeroConto(), conto.getId());

                    // Calcolo importo totale
                    BigDecimal importoTotale = rate.stream()
                            .map(RateDto::getRataTotale)   // prendi il totale di ogni rata
                            .reduce(BigDecimal.ZERO, BigDecimal::add);  // somma tutte le rate

                    fin.setImportoTotale(importoTotale); // aggiorna il totale del finanziamento
                    fin.setStato(StatoFinanziamento.APPROVATO.name());
                    finanziamentoRepository.save(fin);
                    approvati++;
                }
                log.info("Finanziamento {} approvato automaticamente", fin.getNumeroPratica());
            }
        }

        log.info("[FinanziamentoScheduler] Aggiornamento completato. Finanziamenti approvati: {}", approvati);
    }

    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void aggiornaStatoRate() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(5);
        log.info("[RateScheduler] Avvio controllo rate alle {}", now);

        // Gestione rate DA_PAGARE scadute
        List<RateCalcolate> daPagare = rateCalcolateRepository.findByStatoRata(StatoRata.DA_PAGARE.name());
        List<RateCalcolate> daAggiornareScadute = new ArrayList<>();

        for (RateCalcolate rata : daPagare) {
            if (rata.getScadenza() != null && rata.getScadenza().isBefore(now)) {
                rata.setStatoRata(StatoRata.SCADUTO.name());
                daAggiornareScadute.add(rata);
            }
        }

        if (!daAggiornareScadute.isEmpty()) {
            rateCalcolateRepository.saveAll(daAggiornareScadute);
            log.info("[RateScheduler] Aggiornate {} rate a stato SCADUTO", daAggiornareScadute.size());
        } else {
            log.info("[RateScheduler] Nessuna rata scaduta da aggiornare");
        }

        // Gestione rate IN_ATTESA senza transazioni IN_ATTESA
        List<RateCalcolate> inLavorazione = rateCalcolateRepository.findByStatoRata(StatoRata.IN_ATTESA.name());
        List<RateCalcolate> daAggiornarePagate = new ArrayList<>();

        for (RateCalcolate rata : inLavorazione) {
            boolean transazioniInAttesa = transazioneRepository.existsByRataIdAndStato(rata.getId(), StatoTransazione.IN_ATTESA.name() );

            if (!transazioniInAttesa) {
                rata.setStatoRata(StatoRata.PAGATO.name());
                daAggiornarePagate.add(rata);
            }
        }

        if (!daAggiornarePagate.isEmpty()) {
            rateCalcolateRepository.saveAll(daAggiornarePagate);
            log.info("[RateScheduler] Aggiornate {} rate da IN_LAVORAZIONE a PAGATO", daAggiornarePagate.size());
        } else {
            log.info("[RateScheduler] Nessuna rata in attesa da aggiornare a pagato");
        }

        log.info("[RateScheduler] Controllo completato alle {}", LocalDateTime.now());
    }

    @Scheduled(cron = "0 0 18 * * *") // ogni giorno alle 18:00
    @Transactional
    public void aggiornaMarketData() {
        System.out.println("[MarketDataScheduler] Aggiornamento giornaliero dati di mercato...");
        marketDataService.refreshAllSymbols();
        System.out.println("[MarketDataScheduler] Aggiornamento completato");
    }

}

