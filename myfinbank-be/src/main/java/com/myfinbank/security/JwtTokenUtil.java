package com.myfinbank.security;

import com.myfinbank.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Arrays;
import java.util.Date;

@Component
public class JwtTokenUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenUtil.class);


    private final Key key;
    private final long accessTokenValidityMs;
    private final long refreshTokenValidityMs;

    public JwtTokenUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.accessTokenExpirationMs}") long accessTokenExpirationMs,
            @Value("${app.jwt.refreshTokenExpirationMs}") long refreshTokenExpirationMs
    ) {
        this.key = createHmacKey(secret);
        this.accessTokenValidityMs = accessTokenExpirationMs;
        this.refreshTokenValidityMs = refreshTokenExpirationMs;
    }
    private Key createHmacKey(String secret) {
        byte[] keyBytes = secret.getBytes();
        // Rende la chiave di lunghezza 32 byte (256 bit) se è più corta
        if (keyBytes.length < 32) {
            byte[] paddedKey = Arrays.copyOf(keyBytes, 32); // Padding con zeri
            return Keys.hmacShaKeyFor(paddedKey);
        } else if (keyBytes.length > 32) {
            // Se la chiave è troppo lunga, la troncatura garantisce 32 byte esatti
            byte[] truncatedKey = Arrays.copyOf(keyBytes, 32);
            return Keys.hmacShaKeyFor(truncatedKey);
        }
        // Chiave esattamente lunga 32 byte
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenValidityMs);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public void validateToken(String token) throws JwtException {

        Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);

    }

    public String refreshToken(User user) {
        try {
            Date now = new Date();
            Date expiry = new Date(now.getTime() + refreshTokenValidityMs);
            return Jwts.builder()
                    .setSubject(user.getUsername())
                    .setIssuedAt(now)
                    .setExpiration(expiry)
                    .signWith(key, SignatureAlgorithm.HS256)
                    .compact();
        } catch (Exception e) {
            // Log dell'eccezione per approfondimenti
            logger.error("Errore durante la generazione del token di refresh: {}", e.getMessage(), e);
            throw new RuntimeException("Errore interno durante la generazione del token di refresh");
        }
    }

}
