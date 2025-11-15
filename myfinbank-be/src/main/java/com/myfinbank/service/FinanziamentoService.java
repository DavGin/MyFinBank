package com.myfinbank.service;


import com.myfinbank.dto.PagaRataDto;
import com.myfinbank.dto.finanziamento.*;
import com.myfinbank.entity.*;
import com.myfinbank.exception.ResourceNotFoundException;
import com.myfinbank.repository.*;
import com.myfinbank.utils.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.chrono.ChronoLocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class FinanziamentoService {

    private static final Logger logger = LoggerFactory.getLogger(FinanziamentoService.class);


    private final FinanziamentoRepository finanziamentoRepository;
    private final UserRepository userRepository;
    private final RateCalcolateRepository rateCalcolateRepository;
    private final ContoRepository contoRepository;
    private final TransazioneRepository transazioneRepository;
    private final TransazioneService transazioneService;
    private final CartaRepository cartaRepository;

    public FinanziamentoService(FinanziamentoRepository finanziamentoRepository,
                                UserRepository userRepository,
                                RateCalcolateRepository rateCalcolateRepository,
                                ContoRepository contoRepository,
                                TransazioneRepository transazioneRepository,
                                TransazioneService transazioneService, CartaRepository cartaRepository) {
        this.finanziamentoRepository = finanziamentoRepository;
        this.userRepository = userRepository;
        this.rateCalcolateRepository = rateCalcolateRepository;
        this.contoRepository = contoRepository;
        this.transazioneRepository = transazioneRepository;
        this.transazioneService = transazioneService;
        this.cartaRepository = cartaRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username);
        if (user == null) throw new ResourceNotFoundException("error.not.found");
        return user;
    }

    @Transactional
    public FinanziamentoRequestDto createFinanziamentoRequest(FinanziamentoRequestCreateDto dto) {
        User user = getCurrentUser();
        Finanziamento fin = new Finanziamento();
        fin.setUser(user);
        String numeroPratica = Util.generateRandomNumericString(8);
        fin.setNumeroPratica(numeroPratica);
        fin.setImportoRichiesto(dto.getImporto());
        fin.setDurataMesi(dto.getDurataMesi());
        fin.setTassoInteresse(dto.getTassoInteresse());
        fin.setImportoTotale(BigDecimal.ZERO);
        fin.setMotivoFinanziamento(dto.getMotivoFinanziamento());
        fin.setDataChiusura(LocalDateTime.now().plusMonths(dto.getDurataMesi()));
        fin.setStato(StatoFinanziamento.IN_ATTESA_DI_APPROVAZIONE.name());
        finanziamentoRepository.save(fin);

        return FinanziamentoRequestDto.fromEntity(fin);
    }

    @Transactional(readOnly = true)
    public List<FinanziamentoRequestDto> listMutuiUtente() {
        User user = getCurrentUser();
        return finanziamentoRepository.findByUser(user)
                .stream()
                .map(FinanziamentoRequestDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FinanziamentoRequestDto getFinanziamento(String numeroPratica) {
        User user = getCurrentUser();
        Finanziamento fin = finanziamentoRepository.findByNumeroPratica(numeroPratica);
        if (fin == null) {
            throw new ResourceNotFoundException("finanziamento numero " + numeroPratica + " non trovato");
        }
        if (!fin.getUser().getUsername().equals(user.getUsername())) {
            throw new SecurityException("Accesso negato alla richiesta di finanziamento");
        }
        return FinanziamentoRequestDto.fromEntity(fin);
    }

    @Transactional(readOnly = true)
    public List<RateDto> calcolaRata(String numeroPratica) {

        Finanziamento fin = finanziamentoRepository.findByNumeroPratica(numeroPratica);
        if (fin == null) {
            throw new ResourceNotFoundException("Finanziamento numero " + numeroPratica + " non trovato");
        }

//        // Controlla che il finanziamento sia attivo (logica aziendale, se applicabile)
//        if (!finanziamento.getStato().equals(Statofinanziamento.APPROVATO)) {
//            throw new IllegalStateException("Il finanziamento deve essere approvato prima di calcolare le rate");
//        }

        BigDecimal quotaCapitale = fin.getImportoRichiesto();
        int mesi = fin.getDurataMesi();
        BigDecimal tassoAnnuo = fin.getTassoInteresse().divide(BigDecimal.valueOf(100));
        BigDecimal tassoMensile = tassoAnnuo.divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);

        // Rata costante
        double pow = Math.pow(1 + tassoMensile.doubleValue(), -mesi);
        BigDecimal numeratore = quotaCapitale.multiply(tassoMensile);
        BigDecimal denominatore = BigDecimal.ONE.subtract(BigDecimal.valueOf(pow));
        BigDecimal pagamentoMensile = numeratore.divide(denominatore, 2, RoundingMode.HALF_UP);

        List<RateDto> rate = new ArrayList<>();
        BigDecimal saldoRimanente = quotaCapitale;
        LocalDateTime today = LocalDateTime.now();
        List<RateCalcolate> rateCalcolate = new ArrayList<>();


        for (int i = 1; i <= mesi; i++) {
            BigDecimal interessi = saldoRimanente.multiply(tassoMensile).setScale(2, RoundingMode.HALF_UP);
            BigDecimal capitale = pagamentoMensile.subtract(interessi).setScale(2, RoundingMode.HALF_UP);
            saldoRimanente = saldoRimanente.subtract(capitale).setScale(2, RoundingMode.HALF_UP);

            RateDto inst = new RateDto();
            inst.setNumeroRata(i);
            inst.setScadenza(LocalDateTime.now().plusMonths(i));
            inst.setQuotaCapitale(capitale);
            inst.setInteressi(interessi);
            inst.setRataTotale(pagamentoMensile);
            inst.setSaldoRimanente(saldoRimanente.max(BigDecimal.ZERO));

            // Stato rata
            boolean pagata =  rateCalcolateRepository.existsByFinanziamentoAndNumeroRataAndStatoRata(fin, i, StatoRata.PAGATO.name());
            if (pagata) {
                inst.setStatoRata("PAGATO");
            } else if (inst.getScadenza().toLocalDate().isBefore(ChronoLocalDate.from(today))) {
                inst.setStatoRata("SCADUTO");
            } else {
                inst.setStatoRata("DA_PAGARE");
            }

            // Salvare nel database
            RateCalcolate rataCalcolata = new RateCalcolate();
            rataCalcolata.setFinanziamento(fin); // Collegamento con il finanziamento
            logger.debug("Saving rata calcolata con finanziamento ID: {}", rataCalcolata.getFinanziamento().getId());

            rataCalcolata.setNumeroRata(i);
            rataCalcolata.setScadenza(inst.getScadenza());
            rataCalcolata.setQuotaCapitale(capitale);
            rataCalcolata.setInteressi(interessi);
            rataCalcolata.setRataTotale(pagamentoMensile);
            rataCalcolata.setSaldoRimanente(saldoRimanente);
            rataCalcolata.setStatoRata(inst.getStatoRata());

            logger.info("Salvataggio rata calcolata: ", rataCalcolata.getFinanziamento().getId(), i);

            rateCalcolate.add(rataCalcolata);
        }

        rateCalcolateRepository.saveAll(rateCalcolate);
        return RateDto.fromEntityList(rateCalcolate);
    }




    @Transactional(readOnly = true)
    public List<RateDto> simulatoreFinanziamento(SimulazioneFinanziamentoDto request) {

        BigDecimal quotaCapitale = request.getImporto();
        int mesi = request.getDurataMesi();
        BigDecimal tassoAnnuo = request.getTassoInteresse().divide(BigDecimal.valueOf(100));
        BigDecimal tassoMensile = tassoAnnuo.divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);

        // Rata costante
        double pow = Math.pow(1 + tassoMensile.doubleValue(), -mesi);
        BigDecimal numeratore = quotaCapitale.multiply(tassoMensile);
        BigDecimal denominatore = BigDecimal.ONE.subtract(BigDecimal.valueOf(pow));
        BigDecimal pagamentoMensile = numeratore.divide(denominatore, 2, RoundingMode.HALF_UP);

        List<RateDto> schedule = new ArrayList<>();
        BigDecimal saldoRimanente = quotaCapitale;

        for (int i = 1; i <= mesi; i++) {
            BigDecimal interessi = saldoRimanente.multiply(tassoMensile).setScale(2, RoundingMode.HALF_UP);
            BigDecimal capitale = pagamentoMensile.subtract(interessi).setScale(2, RoundingMode.HALF_UP);
            saldoRimanente = saldoRimanente.subtract(capitale).setScale(2, RoundingMode.HALF_UP);

            RateDto inst = new RateDto();
            inst.setNumeroRata(i);
            inst.setScadenza(LocalDateTime.now().plusMonths(i));
            inst.setQuotaCapitale(capitale);
            inst.setInteressi(interessi);
            inst.setRataTotale(pagamentoMensile);
            inst.setSaldoRimanente(saldoRimanente.max(BigDecimal.ZERO));

            schedule.add(inst);
        }

        return schedule;
    }

    @Transactional
    public void pagaRata(PagaRataDto pagaRataDto) {
        Finanziamento fin = finanziamentoRepository.findByNumeroPratica(pagaRataDto.getNumeroPratica());
        if (fin == null) throw new ResourceNotFoundException("Finanziamento non trovato");

        boolean giaPagata = rateCalcolateRepository.existsByFinanziamentoAndNumeroRataAndStatoRata(
                fin, pagaRataDto.getNumeroRata(), StatoRata.PAGATO.name()
        );
        if (giaPagata) throw new IllegalStateException("Rata già pagata");

        RateCalcolate rata = rateCalcolateRepository.findByFinanziamentoAndNumeroRata(fin, pagaRataDto.getNumeroRata());
        if (rata == null) throw new ResourceNotFoundException("Rata non trovata");

        Transazione tx = new Transazione();
        tx.setRata(rata);

        if (pagaRataDto.getNumeroConto() != null && !pagaRataDto.getNumeroConto().isBlank()) {
            Conto conto = contoRepository.findByNumeroConto(pagaRataDto.getNumeroConto());
            if (conto == null) throw new ResourceNotFoundException("Conto non trovato");
            tx.setConto(conto);
            transazioneService.transazionePagaRataConto(tx);
        } else {
            Carta carta = cartaRepository.findByNumeroCarta(pagaRataDto.getNumeroCarta());
            if (carta == null) throw new ResourceNotFoundException("carta.non.trovate");
            if(!Objects.equals(pagaRataDto.getNumeroCarta(), carta.getNumeroCarta()) &&
                    pagaRataDto.getScadenzaCarta() != carta.getDataScadenza() &&
                    !Objects.equals(pagaRataDto.getCVV(), carta.getCvv())){
                throw new ResourceNotFoundException("carta.non.trovate");
            }
            tx.setCarta(carta);
            transazioneService.transazionePagaRataCarta(tx);
        }

        logger.info("Pagamento rata {} per la pratica {} avviato con successo ({})",
                pagaRataDto.getNumeroRata(),
                pagaRataDto.getNumeroPratica(),
                pagaRataDto.getNumeroConto() != null ? "conto" : "carta");
    }



    @Transactional(readOnly = true)
    public List<RateDto> findAllRatesByNumeroPraticaDto(String numeroPratica ) {
        Finanziamento fin = finanziamentoRepository.findByNumeroPratica(numeroPratica);
        List<RateCalcolate> rateEntities = rateCalcolateRepository.findAllByFinanziamento(fin);
        return rateEntities.stream().map(rate -> {
            RateDto dto = new RateDto();
            dto.setNumeroRata(rate.getNumeroRata());
            dto.setQuotaCapitale(rate.getQuotaCapitale());
            dto.setInteressi(rate.getInteressi());
            dto.setRataTotale(rate.getRataTotale());
            dto.setSaldoRimanente(rate.getSaldoRimanente());
            dto.setStatoRata(rate.getStatoRata());
            dto.setScadenza(rate.getScadenza());
            return dto;
        }).collect(Collectors.toList());
    }



}
