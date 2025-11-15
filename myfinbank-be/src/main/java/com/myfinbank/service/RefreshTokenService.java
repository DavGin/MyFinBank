package com.myfinbank.service;

import com.myfinbank.entity.RefreshToken;
import com.myfinbank.entity.User;
import com.myfinbank.exception.ResourceNotFoundException;
import com.myfinbank.repository.RefreshTokenRepository;
import com.myfinbank.repository.UserRepository;
import com.myfinbank.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;


@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtTokenUtil jwtTokenUtil;
    private final long refreshTokenValidityMs;


    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
                               UserRepository userRepository,
                               JwtTokenUtil jwtTokenUtil,
    @Value("${app.jwt.refreshTokenExpirationMs}") long refreshTokenExpirationMs)
    {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.jwtTokenUtil = jwtTokenUtil;
        this.refreshTokenValidityMs = refreshTokenExpirationMs;
    }

    @Transactional
    public RefreshToken createRefreshToken(String username, String refreshToken) {
        User user = userRepository.findByUsername(username);
        if (user == null) throw new ResourceNotFoundException("error.not.found");
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenValidityMs);
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setCreatedAt(now);
        token.setExpiryDate(expiry);
        token.setToken(refreshToken);
        return refreshTokenRepository.save(token);
    }

    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }


    @Transactional
    public int deleteByUserId(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("error.not.found"));
        return refreshTokenRepository.deleteByUser(user);
    }

}
