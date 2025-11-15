package com.myfinbank.service;

import com.myfinbank.dto.CartaDto;
import com.myfinbank.dto.CartaRequest;
import com.myfinbank.entity.Carta;
import com.myfinbank.entity.Conto;
import com.myfinbank.entity.User;
import com.myfinbank.exception.ResourceNotFoundException;
import com.myfinbank.repository.CartaRepository;
import com.myfinbank.repository.ContoRepository;
import com.myfinbank.repository.UserRepository;
import com.myfinbank.utils.StatoCarta;
import com.myfinbank.utils.TipoCarta;
import com.myfinbank.utils.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class CartaService {
    private static final Logger logger = LoggerFactory.getLogger(CartaService.class);

    @Autowired
    private CartaRepository cartaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContoRepository contoRepository;

    @Transactional
    public CartaDto aggiungiCarta(String username, CartaRequest cartaRequest) {

        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("utente.non.trovato");
        }

        List<Carta> listaCarte = cartaRepository.findByUser(user);
        if (listaCarte.size() > 3) {
            throw new IllegalStateException("troppe.carte");
        }

        Carta carta = new Carta();
        carta.setUser(user);
        carta.setTipo(cartaRequest.getTipo());
        carta.setCircuito("VISA");
        carta.setNumeroCarta(Util.generaNumeroCarta());
        carta.setCvv(Util.generaCvc());
        carta.setDataScadenza(YearMonth.now().plusYears(5));
        carta.setStato("ATTIVA");

        // Limiti opzionali
        carta.setLimiteGiornaliero(BigDecimal.valueOf(500));
        carta.setLimiteMensile(BigDecimal.valueOf(2000));
        carta.setPin(Util.generateRandomNumericString(6));

        // Collegamento conto solo se DEBITO o CREDITO
        if ((cartaRequest.getTipo().equalsIgnoreCase(TipoCarta.DEBITO.name()) || cartaRequest.getTipo().equalsIgnoreCase(TipoCarta.CREDITO.name())) && cartaRequest.getNumeroConto() != null) {
            Conto conto = contoRepository.findByNumeroConto(cartaRequest.getNumeroConto());
            if (conto == null) {
                throw  new ResourceNotFoundException("conto.non.trovato");
            }
            carta.setConto(conto);
        }
        cartaRepository.save(carta);
        return CartaDto.fromEntity(carta);
    }

    @Transactional(readOnly = true)
    public List<CartaDto> listCarte(String username) {
        logger.info("Caricamento lista delle carte per l'utente: {}", username);

        User user = userRepository.findByUsername(username);
        if (user == null) throw new ResourceNotFoundException("error.not.found");

        logger.debug("Recuperato utente: {}", user);

        List<Carta> carte = cartaRepository.findByUser(user);
        if (carte == null || carte.isEmpty()) throw new ResourceNotFoundException("carta.non.trovate");

        logger.info("Trovati {} conti per l'utente: {}", carte.size(), username);
        return CartaDto.fromEntity(carte);
    }

    public CartaDto findCartaById(Long id){
        Optional<Carta> carta = cartaRepository.findById(id);
        if(carta.isEmpty()){
            throw new ResourceNotFoundException("carta.non.trovate");
        }

        return CartaDto.fromEntity(carta.get());
    }

    public CartaDto bloccaCarta(Long id){
        Optional<Carta> carta = cartaRepository.findById(id);
        if(carta.isEmpty()){
            throw new ResourceNotFoundException("carta.non.trovate");
        }
        Carta c = carta.get();
        c.setStato(StatoCarta.BLOCCATA.name());
        return CartaDto.fromEntity(carta.get());
    }

    @Transactional
    public CartaDto modificaCarta(Long id, CartaDto dto) {
        Optional<Carta> carta = cartaRepository.findById(id);
        if(carta.isEmpty()){
            throw new ResourceNotFoundException("carta.non.trovate");
        }

        Carta c = carta.get();
        c.setTipo(dto.getTipo());
        c.setCircuito(dto.getCircuito());
        c.setLimiteGiornaliero(dto.getLimiteGiornaliero());
        c.setLimiteMensile(dto.getLimiteMensile());

        cartaRepository.save(c);
        return CartaDto.fromEntity(c);
    }
}
