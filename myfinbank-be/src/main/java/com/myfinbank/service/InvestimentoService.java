package com.myfinbank.service;

import com.myfinbank.dto.MarketDataDto;
import com.myfinbank.dto.investimento.*;
import com.myfinbank.entity.Investimento;
import com.myfinbank.entity.User;
import com.myfinbank.exception.ResourceNotFoundException;
import com.myfinbank.repository.InvestimentoRepository;
import com.myfinbank.repository.UserRepository;
import com.myfinbank.utils.StatoInvestimento;
import com.myfinbank.utils.Util;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class InvestimentoService {

    private final UserRepository userRepository;
    private final InvestimentoRepository investimentoRepository;
    private final MarketDataService marketDataService;

    public InvestimentoService(UserRepository userRepository,
                               InvestimentoRepository investimentoRepository,
                               MarketDataService marketDataService) {
        this.userRepository = userRepository;
        this.investimentoRepository = investimentoRepository;
        this.marketDataService = marketDataService;
    }

    @Transactional
    public InvestimentoDto createInvestment(CreaInvestimentoDto dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username);
        if (user == null) throw new ResourceNotFoundException("Utente non trovato");

        //Recupera il prezzo più recente del simbolo scelto
        List<MarketDataDto> marketData = marketDataService.getMarketData(dto.getSimboloMercato());
        if (marketData.isEmpty()) {
            throw new ResourceNotFoundException("Dati di mercato non disponibili per " + dto.getSimboloMercato());
        }

        MarketDataDto latest = marketData.get(0);
        BigDecimal prezzoCorrente = latest.getClose();

        // Calcolo quantità acquistabile con l’importo investito
        BigDecimal quantita = dto.getImportoInvestito().divide(prezzoCorrente, 6, BigDecimal.ROUND_HALF_UP);

        // Crea l’entità investimento
        Investimento inv = new Investimento();
        inv.setUser(user);
        inv.setIdentificativo(Util.generateRandomNumericString(8));
        inv.setTipoInvestimento(dto.getTipoInvestimento() + " - " + dto.getSimboloMercato());
        inv.setImportoInvestito(dto.getImportoInvestito());
        inv.setTassoRitornoPrevisto(dto.getTassoRitornoPrevisto());
        inv.setStatoInvestimento(StatoInvestimento.ACTIVE.name());
        inv.setDataInizio(LocalDateTime.now());
        inv.setDataFine(LocalDateTime.now().plusMonths(dto.getDurataMesi()));
        inv.setMesi(dto.getDurataMesi());

        //Potresti salvare anche le info di mercato, se vuoi:
         inv.setPrezzoIngresso(prezzoCorrente);
         inv.setQuantita(quantita);

        inv.setSimboloMercato(dto.getSimboloMercato());


        Investimento salvato = investimentoRepository.save(inv);

        return InvestimentoDto.fromEntity(salvato);
    }

    @Transactional(readOnly = true)
    public List<RendimentoDto> calcolaRendimenti(String identificativo) {
        Investimento investimento = investimentoRepository.findByIdentificativo(identificativo)
                .orElseThrow(() -> new ResourceNotFoundException("Investimento non trovato"));

        // Dati base
        BigDecimal importo = investimento.getImportoInvestito();
        String symbol = investimento.getSimboloMercato();

        // Recupera dati storici di mercato
        List<MarketDataDto> datiMercato = marketDataService.getMarketData(symbol);

        if (datiMercato.isEmpty()) {
            throw new RuntimeException("Nessun dato di mercato disponibile per " + symbol);
        }

        // Ordina per data crescente
        datiMercato.sort(Comparator.comparing(MarketDataDto::getDate));

        List<RendimentoDto> rendimenti = new ArrayList<>();
        BigDecimal valore = importo;
        BigDecimal valoreIniziale = importo;

        // Prendiamo l’ultimo N mesi di dati
        int mesi = investimento.getMesi();
        List<MarketDataDto> ultimiDati = datiMercato.stream()
                .limit(mesi)
                .toList();

        for (int i = 0; i < ultimiDati.size(); i++) {
            MarketDataDto corrente = ultimiDati.get(i);
            MarketDataDto precedente = i > 0 ? ultimiDati.get(i - 1) : null;

            BigDecimal rendimento = BigDecimal.ZERO;

            if (precedente != null) {
                BigDecimal variazionePercentuale = corrente.getClose()
                        .subtract(precedente.getClose())
                        .divide(precedente.getClose(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));

                // Applichiamo la variazione al valore attuale dell’investimento
                rendimento = valore.multiply(variazionePercentuale)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                valore = valore.add(rendimento);
            }

            rendimenti.add(new RendimentoDto(
                    corrente.getDate(),
                    valoreIniziale,
                    rendimento,
                    valore
            ));
        }

        return rendimenti;
    }




    @Transactional(readOnly = true)
    public List<InvestimentoDto> getListaInvestimentiAttivi () {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username);
        if (user == null) throw new ResourceNotFoundException("error.not.found");

        return investimentoRepository.findByUser(user)
                .stream()
                .map(InvestimentoDto::fromEntity)
                .toList();
    }

    @Transactional
    public InvestimentoDto chiudiInvestimento(String identificativo) {
        Investimento inv = investimentoRepository.findByIdentificativo(identificativo)
                .orElseThrow(() -> new ResourceNotFoundException("Investimento " +  identificativo + " non trovato"));
        inv.setStatoInvestimento(StatoInvestimento.CLOSED.name());
        inv.setDataFine(LocalDateTime.now());
        return InvestimentoDto.fromEntity(investimentoRepository.save(inv));
    }

    @Transactional(readOnly = true)
    public ProiezioneInvestimentoDto proiezioneInvestimento(String identificativo, int mesi) {
        Investimento inv = investimentoRepository.findByIdentificativo(identificativo)
                .orElseThrow(() -> new ResourceNotFoundException("Investimento " + identificativo + " non trovato"));

        BigDecimal iniziale = inv.getImportoInvestito();
        BigDecimal tasso = inv.getTassoRitornoPrevisto().divide(BigDecimal.valueOf(100));

        BigDecimal importoFinale = iniziale.multiply(
                BigDecimal.valueOf(Math.pow(1 + tasso.doubleValue(), mesi))
        ).setScale(2, RoundingMode.HALF_UP);

        ProiezioneInvestimentoDto dto = ProiezioneInvestimentoDto.fromEntity(inv);
        dto.setImportoTotale(importoFinale);
        return dto;

    }

    @Transactional(readOnly = true)
    public SimulazioneInvestimentoOutputDto simulaInvestimento(SimulazioneInvestimentoDto request) {
        BigDecimal importoIniziale = request.getImportoIniziale();
        BigDecimal rate = request.getTassoPrevisto().divide(BigDecimal.valueOf(100));
        int mesi = request.getMesi();

        BigDecimal importoFinale = importoIniziale.multiply(
                BigDecimal.valueOf(Math.pow(1 + rate.doubleValue(), mesi))
        ).setScale(2, RoundingMode.HALF_UP);

        SimulazioneInvestimentoOutputDto dto = new SimulazioneInvestimentoOutputDto();
        dto.setImportoIniziale(importoIniziale);
        dto.setTassoPrevisto(request.getTassoPrevisto());
        dto.setMesi(mesi);
        dto.setImportoFinale(importoFinale);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<RendimentoInvestimentoDto> getStoricoRendimenti(String numeroIdentificativo ) {
        Investimento inv = investimentoRepository.findByIdentificativo(numeroIdentificativo)
                .orElseThrow(() -> new ResourceNotFoundException("Investimento " + numeroIdentificativo + " non trovato"));

        BigDecimal importo = inv.getImportoInvestito();
        BigDecimal tassoMensile = inv.getTassoRitornoPrevisto()
                .divide(BigDecimal.valueOf(100 * 12), 10, RoundingMode.HALF_UP);
        int mesi = inv.getMesi();

        List<RendimentoInvestimentoDto> storico = new ArrayList<>();
        BigDecimal valoreAttuale = importo;

        for (int i = 1; i <= mesi; i++) {
            BigDecimal rendimento = valoreAttuale.multiply(tassoMensile).setScale(2, RoundingMode.HALF_UP);
            BigDecimal nuovoValore = valoreAttuale.add(rendimento).setScale(2, RoundingMode.HALF_UP);

            String periodo = String.format("%d-%02d",
                    inv.getDataInizio().getYear(),
                    inv.getDataInizio().getMonthValue() + i > 12
                            ? (inv.getDataInizio().getYear() + (inv.getDataInizio().getMonthValue() + i - 1) / 12)
                            : inv.getDataInizio().getYear()
            ) + "-" +
                    String.format("%02d", ((inv.getDataInizio().getMonthValue() + i - 1) % 12) + 1);

            storico.add(new RendimentoInvestimentoDto(periodo, valoreAttuale, rendimento, nuovoValore));

            valoreAttuale = nuovoValore;
        }

        return storico;
    }
}

