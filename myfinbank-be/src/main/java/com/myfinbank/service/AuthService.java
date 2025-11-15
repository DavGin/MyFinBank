package com.myfinbank.service;

import com.myfinbank.dto.*;
import com.myfinbank.entity.Conto;
import com.myfinbank.entity.RefreshToken;
import com.myfinbank.entity.User;
import com.myfinbank.exception.*;
import com.myfinbank.repository.ContoRepository;
import com.myfinbank.repository.UserRepository;
import com.myfinbank.security.JwtTokenUtil;
import com.myfinbank.utils.Ruoli;
import com.myfinbank.utils.TipoConto;
import com.myfinbank.utils.UserStato;
import com.myfinbank.utils.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenUtil jwtTokenUtil;
    private final ContoService contoService;
    private final ContoRepository contoRepository;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       RefreshTokenService refreshTokenService,
                       JwtTokenUtil jwtTokenUtil, ContoService contoService, ContoRepository contoRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;

        this.refreshTokenService = refreshTokenService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.contoService = contoService;
        this.contoRepository = contoRepository;
    }

    @Transactional
    public void register(RegisterRequest request) {
        logger.info("Avvio della registrazione per l'utente: {}", request.getNome()+ " " + request.getCognome());

        if (userRepository.existsByEmail(request.getEmail())) {
            logger.warn("Registrazione fallita: email già in uso - {}", request.getEmail());
            throw new EmailAlreadyUsedException("utente.email.gia.usata");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            logger.warn("Registrazione fallita: Username già in uso - {}", request.getUsername());
            throw new UsernameAlreadyUsedException("utente.username.gia.usato");
        }

        User u = new User();
        u.setUsername(request.getUsername());
        u.setEmail(request.getEmail());
        u.setPassword(passwordEncoder.encode(request.getPassword()));
        u.setNome(request.getNome());
        u.setCognome(request.getCognome());
        u.setCodiceFiscale(request.getCodiceFiscale());
        u.setDataNascita(request.getDataNascita());
        u.setRuolo(Ruoli.ROLE_USER.name());
        u.setStato(UserStato.ATTIVO.name());
        u.setUltimoAccesso(LocalDateTime.now());

        userRepository.save(u);
        logger.info("Registrazione completata con successo per l'utente: {}", request.getNome()+ " " + request.getCognome());

        User user = userRepository.findByUsername(request.getUsername());

        if(user == null) {
            throw new ResourceNotFoundException("utente.non.trovato");
        }

        String numeroConto = Util.generateRandomNumericString(10);
        Conto conto = new Conto();
        conto.setTipo(TipoConto.CONTO_CORRENTE.name());
        conto.setUser(user);
        conto.setNumeroConto(numeroConto);
        conto.setIban(Util.generateIban("IT", "12345", "67890", numeroConto));
        conto.setValuta("EURO");
        conto.setSaldoDisponibile(BigDecimal.ZERO);
        conto.setSaldoContabile(BigDecimal.ZERO);
        conto.setUltimoAggiornamento(LocalDateTime.now());

        contoRepository.save(conto);
        logger.info("Creato un nuovo conto per l'utente: {}, Numero Conto: {}", u.getUsername(), numeroConto);

    }

    public AuthResponse login(AuthRequest request) {
        logger.info("Tentativo di login per l'utente: {}", request.getIdentifier());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getIdentifier(), request.getPassword())
            );
        } catch (DisabledException e) {
            throw new DisabledException("utente.disabilitato");
        }

        User user = new User();

        if(request.getIdentifier().contains("@")) {
            user = userRepository.findByEmail(request.getIdentifier());
        } else {
            user = userRepository.findByUsername(request.getIdentifier());
        }

        if(user == null) {
            throw  new ResourceNotFoundException("Utente non trovato");
        }

        user.setUltimoAccesso(LocalDateTime.now());
        userRepository.save(user);
        logger.info("Login riuscito per l'utente: {}", user.getUsername());

        String accessToken = jwtTokenUtil.generateAccessToken(user.getUsername());
        String refreshToken = jwtTokenUtil.refreshToken(user);

        refreshTokenService.createRefreshToken(user.getUsername(), refreshToken);
        logger.info("Token di refresh generato ----> " + refreshToken);
        logger.info("Token di accesso e refresh generati per l'utente: {}", user.getUsername());

        return new AuthResponse(accessToken, refreshToken, user.getUsername());
    }

    public AuthResponse refreshAccessToken(String refreshToken) {
        logger.info("Richiesta di refresh del token di accesso con il token di refresh: {}", refreshToken);

        RefreshToken stored = refreshTokenService.findByToken(refreshToken);
        if (stored == null) {
            throw new InvalidTokenException("Refresh token trovato");
        }

        if (stored.getExpiryDate().before(new Date())) {
            logger.warn("Token di refresh scaduto: {}", refreshToken);
            throw new RuntimeException("Refresh token expired");
        }

        User user = stored.getUser();
        String newAccessToken = jwtTokenUtil.generateAccessToken(user.getUsername());
        String newRefreshToken = jwtTokenUtil.refreshToken(user);
        refreshTokenService.createRefreshToken(user.getUsername(), newRefreshToken);
        logger.info("Nuovo token di accesso generato per l'utente: {}", user.getUsername());

        return new AuthResponse(newAccessToken, newRefreshToken, user.getUsername());
    }

    @Transactional
    public void logout(User user) {
        logger.info("Logout per l'utente: {}", user.getUsername());
        logger.info("Eliminazione token di accesso e refresh per l'utente: {}", user.getId());
        refreshTokenService.deleteByUserId(user.getId());
    }
}
