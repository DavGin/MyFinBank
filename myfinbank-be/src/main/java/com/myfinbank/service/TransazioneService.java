package com.myfinbank.service;

import com.myfinbank.dto.PaginatedTransazioniDto;
import com.myfinbank.dto.TransazioneDto;
import com.myfinbank.entity.Carta;
import com.myfinbank.entity.Conto;
import com.myfinbank.entity.RateCalcolate;
import com.myfinbank.entity.Transazione;
import com.myfinbank.exception.ResourceNotFoundException;
import com.myfinbank.exception.SaldoInsufficienteException;
import com.myfinbank.repository.CartaRepository;
import com.myfinbank.repository.ContoRepository;
import com.myfinbank.repository.RateCalcolateRepository;
import com.myfinbank.repository.TransazioneRepository;
import com.myfinbank.utils.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TransazioneService {

    private static final Logger logger = LoggerFactory.getLogger(TransazioneService.class);


    private final TransazioneRepository transazioneRepository;
    private final ContoRepository contoRepository;
    private final RateCalcolateRepository rateCalcolateRepository;
    private final CartaRepository cartaRepository;

    public TransazioneService(TransazioneRepository transazioneRepository,
                              ContoRepository contoRepository,
                              RateCalcolateRepository rateCalcolateRepository, CartaRepository cartaRepository) {
        this.transazioneRepository = transazioneRepository;
        this.contoRepository = contoRepository;
        this.rateCalcolateRepository = rateCalcolateRepository;
        this.cartaRepository = cartaRepository;
    }

    private String getCurrentUserUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private void validateAccountOwnership(Conto conto) {
        String username = getCurrentUserUsername();
        if (!conto.getUser().getUsername().equals(username)) {
            throw new SecurityException("Accesso negato: il conto non appartiene all’utente loggato");
        }
    }

    private void validateCartaAccountOwnership(Carta carta) {
        String username = getCurrentUserUsername();
        if (!carta.getUser().getUsername().equals(username)) {
            throw new SecurityException("Accesso negato: la carta non appartiene all’utente loggato");
        }
    }

    @Transactional
    public TransazioneDto creaTransazione(TransazioneDto dto) {
        String numeroConto = dto.getNumeroConto();
        logger.info("Avvio della creazione di una transazione per il conto: {}", numeroConto);

        Conto sorgente = contoRepository.findByNumeroConto(numeroConto);
        if(sorgente == null) {
            throw new ResourceNotFoundException("conto.non.trovato");
        }

        if (sorgente.getDataChiusura() != null) {
            logger.error("Tentativo di chiudere un conto già chiuso. NumeroConto: {}", numeroConto);
            throw new IllegalStateException("Il conto è chiuso.");
        }

        logger.debug("Conto sorgente recuperato: {} | Saldo attuale: {}", numeroConto, sorgente.getSaldoDisponibile());

        validateAccountOwnership(sorgente);
        logger.info("Proprietà del conto validata per l'utente: {}", getCurrentUserUsername());
        Transazione tx = new Transazione();
        tx.setConto(sorgente);
        tx.setTipoTransazione(dto.getTipoTransazione());
        tx.setImporto(dto.getImporto());
        tx.setValuta(dto.getValuta());
        tx.setDescrizione(dto.getDescrizione());
        tx.setCategoria(dto.getCategoria());
        tx.setStato("IN_ATTESA");

        logger.info("Dettagli della transazione: Tipo: {}, Importo: {}, Valuta: {}",
                dto.getTipoTransazione(), dto.getImporto(), dto.getValuta());

        if (TipoTransazione.DEPOSITO.name().equalsIgnoreCase(dto.getTipoTransazione())) {
            sorgente.setSaldoDisponibile(sorgente.getSaldoDisponibile().add(dto.getImporto()));
            tx.setDirezione(DirezioneTransazione.ENTRATA.name());
            logger.info("Deposito effettuato. Nuovo saldo: {}", sorgente.getSaldoDisponibile());
            contoRepository.save(sorgente);
        } else if (TipoTransazione.PRELIEVO.name().equalsIgnoreCase(dto.getTipoTransazione()) || TipoTransazione.RATA_FINANZIAMENTO.name().equalsIgnoreCase(dto.getTipoTransazione())) {
            if (sorgente.getSaldoDisponibile().compareTo(dto.getImporto()) < 0) {
                logger.error("Saldo insufficiente per prelievo. Saldo attuale: {}, Importo richiesto: {}",
                        sorgente.getSaldoDisponibile(), dto.getImporto());
                throw new SaldoInsufficienteException("saldo.insufficiente");
            }
            tx.setDirezione(DirezioneTransazione.USCITA.name());
            sorgente.setSaldoDisponibile(sorgente.getSaldoDisponibile().subtract(dto.getImporto()));
            logger.info("Prelievo effettuato. Nuovo saldo: {}", sorgente.getSaldoDisponibile());
            contoRepository.save(sorgente);

        } else if (TipoTransazione.BONIFICO.name().equalsIgnoreCase(dto.getTipoTransazione()) || TipoTransazione.PAGAMENTO.name().equalsIgnoreCase(dto.getTipoTransazione())) {
            if (sorgente.getSaldoDisponibile().compareTo(dto.getImporto()) < 0) {
                logger.error("Saldo insufficiente per prelievo. Saldo attuale: {}, Importo richiesto: {}",
                        sorgente.getSaldoDisponibile(), dto.getImporto());
                throw new SaldoInsufficienteException("saldo.insufficiente");
            }

            Conto target = contoRepository.findByIban(dto.getTargetIban());
            if (target == null) {
                throw new ResourceNotFoundException("iban.non.trovato");
            }

            if (!sorgente.getUser().getId().equals(target.getUser().getId())) {
                logger.info("Bonifico inter-utente: {} -> {} | Importo: {} {}",
                        sorgente.getUser().getUsername(),
                        target.getUser().getUsername(),
                        dto.getImporto(),
                        dto.getValuta());
            }

            sorgente.setSaldoDisponibile(sorgente.getSaldoDisponibile().subtract(dto.getImporto()));
            sorgente.setUltimoAggiornamento(LocalDateTime.now());

            target.setSaldoDisponibile(target.getSaldoDisponibile().add(dto.getImporto()));
            target.setUltimoAggiornamento(LocalDateTime.now());

            contoRepository.save(sorgente);
            contoRepository.save(target);

            tx.setDirezione(DirezioneTransazione.USCITA.name());

            logger.info("Bonifico completato con successo da {} a {}. Importo: {} {}",
                    sorgente.getNumeroConto(),
                    target.getNumeroConto(),
                    dto.getImporto(),
                    dto.getValuta());

            // Registra transazione lato destinatario
            Transazione inEntrata = new Transazione();
            inEntrata.setConto(target);
            inEntrata.setTipoTransazione(dto.getTipoTransazione());
            inEntrata.setImporto(dto.getImporto());
            inEntrata.setValuta(dto.getValuta());
            inEntrata.setDirezione(DirezioneTransazione.ENTRATA.name());
            inEntrata.setStato("IN_ATTESA");
            inEntrata.setCategoria(dto.getCategoria());
            inEntrata.setDescrizione("Bonifico ricevuto da " + sorgente.getUser().getNome() + " " + sorgente.getUser().getCognome() + " per " + dto.getDescrizione());
        
            logger.debug("Registrazione transazione in entrata per il destinatario {}", target.getNumeroConto());
            transazioneRepository.save(inEntrata);
        } else {
            logger.warn("Tipo di transazione sconosciuto: {}", dto.getTipoTransazione());
        }

        transazioneRepository.save(tx);
        logger.info("Transazione completata e salvata nel sistema: {}", tx);

        return TransazioneDto.fromEntity(tx);
    }

    public TransazioneDto transazionePagaRataConto(Transazione transazione) {
        RateCalcolate rata = transazione.getRata();
        Conto conto = transazione.getConto();

        logger.info("Creazione transazione per rata {} sul conto {}", rata.getId(), conto.getNumeroConto());

        if (conto.getDataChiusura() != null) {
            throw new IllegalStateException("Il conto è chiuso");
        }

        validateAccountOwnership(conto);

        BigDecimal importo = rata.getRataTotale();
        if (conto.getSaldoDisponibile().compareTo(importo) < 0) {
            throw new SaldoInsufficienteException("saldo.insufficiente");
        }

        Transazione tx = new Transazione();
        tx.setConto(conto);
        tx.setRata(rata);
        tx.setTipoTransazione(TipoTransazione.RATA_FINANZIAMENTO.name());
        tx.setImporto(importo);
        tx.setValuta("EUR");
        tx.setDescrizione("Pagamento rata #" + rata.getNumeroRata() + " per finanziamento ID " + rata.getFinanziamento().getId());
        tx.setCategoria("FINANZIAMENTO");
        tx.setDirezione(DirezioneTransazione.USCITA.name());
        tx.setStato(StatoTransazione.IN_ATTESA.name());
        tx.setDataTransazione(LocalDateTime.now());
        tx.setDataContabile(LocalDateTime.now());

        conto.setSaldoDisponibile(conto.getSaldoDisponibile().subtract(importo));
        conto.setUltimoAggiornamento(LocalDateTime.now());
        contoRepository.save(conto);

        rata.setStatoRata(StatoRata.IN_ATTESA.name());
        rateCalcolateRepository.save(rata);

        transazioneRepository.save(tx);

        logger.info("Creata transazione {} per rata {} in stato IN_ATTESA", tx.getId(), rata.getId());
        return TransazioneDto.fromEntity(tx);
    }

    public TransazioneDto transazionePagaRataCarta(Transazione transazione) {

        Transazione tx = new Transazione();

        RateCalcolate rata = transazione.getRata();
        BigDecimal importo = rata.getRataTotale();
        Carta carta = transazione.getCarta();

        if(!(transazione.getCarta().getConto() == null)) {
            Conto conto = contoRepository.findById(carta.getConto().getId()).orElse(null);
            logger.info("Creazione transazione per rata {} sul conto {}", rata.getId(), conto.getNumeroConto());

            if (conto.getDataChiusura() != null) {
                throw new IllegalStateException("Il conto è chiuso");
            }

            validateAccountOwnership(conto);


            if (conto.getSaldoDisponibile().compareTo(importo) < 0) {
                throw new SaldoInsufficienteException("saldo.insufficiente");
            }

            tx.setConto(conto);
            tx.setCarta(carta);
            tx.setRata(rata);
            tx.setTipoTransazione(TipoTransazione.RATA_FINANZIAMENTO.name());
            tx.setImporto(importo);
            tx.setValuta("EUR");
            tx.setDescrizione("Pagamento rata n°" + rata.getNumeroRata() + " per finanziamento " + rata.getFinanziamento().getNumeroPratica());
            tx.setCategoria("FINANZIAMENTO");
            tx.setDirezione(DirezioneTransazione.USCITA.name());
            tx.setStato(StatoTransazione.IN_ATTESA.name());
            tx.setDataTransazione(LocalDateTime.now());

            conto.setSaldoDisponibile(conto.getSaldoDisponibile().subtract(importo));
            conto.setUltimoAggiornamento(LocalDateTime.now());
            contoRepository.save(conto);

            rata.setStatoRata(StatoRata.IN_ATTESA.name());
            rateCalcolateRepository.save(rata);

            transazioneRepository.save(tx);
        } else {
            if (carta.getStato() == StatoCarta.SCADUTA.name() || carta.getStato() == StatoCarta.BLOCCATA.name() ) {
                throw new IllegalStateException("La carte è scaduta o bloccata");
            }

            if(carta.getSaldoCarta().compareTo(importo) < 0){
                throw new SaldoInsufficienteException("saldo.insufficiente");
            }

            tx.setCarta(transazione.getCarta());
            tx.setRata(rata);
            tx.setTipoTransazione(TipoTransazione.RATA_FINANZIAMENTO.name());
            tx.setImporto(importo);
            tx.setValuta("EUR");
            tx.setDescrizione("Pagamento rata #" + rata.getNumeroRata() + " per finanziamento " + rata.getFinanziamento().getNumeroPratica());
            tx.setCategoria("FINANZIAMENTO");
            tx.setDirezione(DirezioneTransazione.USCITA.name());
            tx.setStato(StatoTransazione.IN_ATTESA.name());
            tx.setDataTransazione(LocalDateTime.now());

            carta.setSaldoCarta(carta.getSaldoCarta().subtract(importo));
            cartaRepository.save(carta);

            rata.setStatoRata(StatoRata.IN_ATTESA.name());
            rateCalcolateRepository.save(rata);

            transazioneRepository.save(tx);

        }
        logger.info("Creata transazione {} per rata {} in stato IN_ATTESA", tx.getId(), rata.getId());
        return TransazioneDto.fromEntity(tx);
    }


    @Transactional(readOnly = true)
    public PaginatedTransazioniDto listTransazioni(String numeroConto,int page, int size) {
        Conto conto = contoRepository.findByNumeroConto(numeroConto);
        if (conto == null) {
            throw new ResourceNotFoundException("conto.non.trovato");
        }

        validateAccountOwnership(conto);

        Pageable pageable = PageRequest.of(page, size);
        Page<Transazione> pageResult = transazioneRepository.findByConto(conto, pageable);

        PaginatedTransazioniDto result = new PaginatedTransazioniDto();
        result.setContent(pageResult.stream().map(TransazioneDto::fromEntity).toList());
        result.setTotalElements((int) pageResult.getTotalElements());
        result.setNumber(pageResult.getNumber());
        result.setSize(pageResult.getSize());

        return result;
    }


    @Transactional(readOnly = true)
    public PaginatedTransazioniDto listTransazioniCarta(String numeroCarta,int page, int size) {
        Carta carta = cartaRepository.findByNumeroCarta(numeroCarta);
        if (carta == null) {
            throw new ResourceNotFoundException("carta.non.trovate");
        }

        validateCartaAccountOwnership(carta);

        Pageable pageable = PageRequest.of(page, size);
        Page<Transazione> pageResult = transazioneRepository.findByCarta(carta, pageable);

        PaginatedTransazioniDto result = new PaginatedTransazioniDto();
        result.setContent(pageResult.stream().map(TransazioneDto::fromEntity).toList());
        result.setTotalElements((int) pageResult.getTotalElements());
        result.setNumber(pageResult.getNumber());
        result.setSize(pageResult.getSize());

        return result;
    }

    public TransazioneDto findById(Long id) {
        Optional<Transazione> transazione = transazioneRepository.findById(id);
        if(transazione.isEmpty()) {
            throw new ResourceNotFoundException("transazione.non.trovato");
        }
        return TransazioneDto.fromEntity(transazione.get());
    }
}
