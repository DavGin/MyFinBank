package com.myfinbank.repository;

import com.myfinbank.entity.RefreshToken;
import com.myfinbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;


public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
   RefreshToken findByToken(String token);
    int deleteByUser(User user);
}
