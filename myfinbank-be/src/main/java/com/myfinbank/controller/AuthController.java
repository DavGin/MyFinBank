package com.myfinbank.controller;

import com.myfinbank.dto.*;
import com.myfinbank.entity.User;
import com.myfinbank.service.AuthService;
import com.myfinbank.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticazione", description = "Gestione login, registrazione e refresh token")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) { this.authService = authService; this.userService = userService; }

    @PostMapping(value="/register")
    @Operation(summary = "Registra un nuovo utente")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        logger.info("Inizio registrazione per utente: {}", request.getUsername());
        try {
            authService.register(request);
            logger.info("Registrazione completata con successo per utente: {}", request.getUsername());
            return ResponseEntity.status(201).build();
        } catch (IllegalArgumentException ex) {
            logger.error("Errore durante la registrazione: {}", ex.getMessage(), ex);
            return ResponseEntity
                    .badRequest()
                    .header(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8")
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        AuthResponse authResponse = authService.login(request);


        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", authResponse.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(Duration.ofMinutes(20))
                .build();

        logger.info("REFRESH_TOKEN ----> " + authResponse.getRefreshToken());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(Map.of(
                        "accessToken", authResponse.getAccessToken(),
                        "username", authResponse.getUsername()
                ));
    }

    @PostMapping("/refresh")
    public ResponseEntity refreshToken(@CookieValue("refreshToken") String refreshToken) {
        logger.info("REFRESH_TOKEN ----> " + refreshToken);
        AuthResponse newTokens = authService.refreshAccessToken(refreshToken);


        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", newTokens.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(Duration.ofDays(20))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(Map.of("accessToken", newTokens.getAccessToken()));
    }


    @PostMapping("/logout")
    @Operation(summary = "Logout utente")
    public ResponseEntity logout(@AuthenticationPrincipal UserDetails userDetails) {

        logger.info("Logout completato con successo");
        User user = userService.getProfile(userDetails.getUsername());
        authService.logout(user);

        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/api/auth/refresh")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(Map.of("message", "Logout completato con successo!"));



    }
}
