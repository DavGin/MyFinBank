package com.myfinbank.service;

import com.myfinbank.dto.ContoDto;
import com.myfinbank.entity.Conto;
import com.myfinbank.entity.Transazione;
import com.myfinbank.entity.User;
import com.myfinbank.exception.ResourceNotFoundException;
import com.myfinbank.repository.ContoRepository;
import com.myfinbank.repository.TransazioneRepository;
import com.myfinbank.repository.UserRepository;
import com.myfinbank.utils.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContoService {

    private static final Logger logger = LoggerFactory.getLogger(ContoService.class);

    private final ContoRepository contoRepository;
    private final UserRepository userRepository;
    private final TransazioneRepository transazioneRepository;

    public ContoService(ContoRepository contoRepository, UserRepository userRepository, TransazioneRepository transazioneRepository) {
        this.contoRepository = contoRepository;
        this.userRepository = userRepository;
        this.transazioneRepository = transazioneRepository;
    }

    @Transactional
    public ContoDto createConto(String username, ContoDto dto) {
        logger.info("Avvio creazione del conto per l'utente: {}", username);

        User user = userRepository.findByUsername(username);
        if (user == null) throw new ResourceNotFoundException("error.not.found");

        logger.debug("Recuperato utente: {}", user);
        String numeroConto = Util.generateRandomNumericString(10);
        Conto conto = new Conto();
        conto.setUser(user);
        conto.setNumeroConto(numeroConto);
        conto.setTipo(dto.getTipo());
        conto.setIban(Util.generateIban("IT", "12345", "67890", numeroConto));
        conto.setValuta(dto.getValuta());
        conto.setSaldoDisponibile(dto.getSaldoDisponibile() != null ? dto.getSaldoDisponibile() : BigDecimal.ZERO);
        conto.setSaldoContabile(dto.getSaldoContabile() != null ? dto.getSaldoContabile() : BigDecimal.ZERO);
        conto.setUltimoAggiornamento(LocalDateTime.now());

        contoRepository.save(conto);

        logger.info("Conto creato con successo per l'utente: {}, Numero Conto: {}", username, dto.getNumeroConto());
        return ContoDto.fromEntity(conto);
    }

    @Transactional(readOnly = true)
    public List<ContoDto> listConti(String username) {
        logger.info("Caricamento lista dei conti per l'utente: {}", username);

        User user = userRepository.findByUsername(username);
        if (user == null) throw new ResourceNotFoundException("error.not.found");

        logger.debug("Recuperato utente: {}", user);

        List<Conto> conti = contoRepository.findByUser(user);
        if (conti == null || conti.isEmpty()) throw new ResourceNotFoundException("conto.non.trovato");

        logger.info("Trovati {} conti per l'utente: {}", conti.size(), username);
        return ContoDto.fromEntityList(conti);
    }

    @Transactional(readOnly = true)
    public ContoDto findByNumeroConto(String numeroConto) {
        logger.info("Ricerca conto per NumeroConto: {}", numeroConto);

        Conto conto = contoRepository.findByNumeroConto(numeroConto);
        if(conto == null) throw new ResourceNotFoundException("conto.non.trovato");

        logger.info("Conto trovato per NumeroConto: {}", numeroConto);
        return ContoDto.fromEntity(conto);
    }

    @Transactional
    public void chiudiConto(String numeroConto) {
        logger.info("Avvio chiusura del conto per NumeroConto: {}", numeroConto);

        Conto conto = contoRepository.findByNumeroConto(numeroConto);
        if(conto == null) throw new ResourceNotFoundException("conto.non.trovato");

        List<Transazione> transazioni = transazioneRepository.findByConto(conto);
        for (Transazione transazione : transazioni) {
            transazioneRepository.delete(transazione);
        }

        if (conto.getDataChiusura() != null) {
            logger.error("Tentativo di chiudere un conto già chiuso. NumeroConto: {}", numeroConto);
            throw new IllegalStateException("Il conto è già stato chiuso.");
        }

        conto.setDataChiusura(LocalDateTime.now());
        conto.setSaldoContabile(BigDecimal.ZERO); // Azzeriamo il saldo se richiesto dalla logica.
        conto.setSaldoDisponibile(BigDecimal.ZERO); // Azzeriamo il saldo se richiesto dalla logica.
        conto.setUltimoAggiornamento(LocalDateTime.now());
        conto.setUser(userRepository.findByUsername(numeroConto));
        contoRepository.delete(conto);

        logger.info("Conto chiuso con successo per NumeroConto: {}", numeroConto);
    }

}
