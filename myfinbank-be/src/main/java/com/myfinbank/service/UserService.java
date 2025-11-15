package com.myfinbank.service;

import com.myfinbank.dto.PasswordUpdateRequest;
import com.myfinbank.dto.ProfileUpdateRequest;
import com.myfinbank.dto.UserProfileDto;
import com.myfinbank.entity.User;
import com.myfinbank.exception.ResourceNotFoundException;
import com.myfinbank.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public User getProfile(String username) {
        logger.info("Fetching profile for username: {}", username);
        User user = userRepository.findByUsername(username);

        if (user == null) throw new ResourceNotFoundException("error.not.found");

        logger.info("Profile fetched successfully for username: {}", username);

        return user;
    }

    public List<UserProfileDto> findAll() {
        logger.info("Fetching all user profiles");
        List<UserProfileDto> userProfiles = userRepository.findAll().stream()
                .map(UserProfileDto::fromEntity)
                .collect(Collectors.toList());
        logger.info("{} user profiles fetched successfully", userProfiles.size());
        return userProfiles;
    }

    @Transactional
    public User updateProfile(String username, ProfileUpdateRequest dto) {
        logger.info("Updating profile for username: {}", username);
        User user = userRepository.findByUsername(username);

        if(user ==  null) throw new ResourceNotFoundException("error.not.found");

        logger.debug("Updating fields for user: [{}]", username);
        user.setNome(dto.getNome());
        user.setCognome(dto.getCognome());
        user.setCodiceFiscale(dto.getCodiceFiscale());
        user.setDataNascita(dto.getDataNascita());
        userRepository.save(user);

        logger.info("Profile updated successfully for username: {}", username);
        return getProfile(username);
    }

    public void updatePassword(String username, PasswordUpdateRequest request) {
        logger.info("Updating password for username: {}", username);
        User user = userRepository.findByUsername(username);

        if(user ==  null) throw new ResourceNotFoundException("error.not.found");

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            logger.error("Old password is incorrect for username: {}", username);
            throw new IllegalArgumentException("Old password is incorrect");
        }

        logger.debug("Encoding and updating new password for username: {}", username);
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        logger.info("Password updated successfully for username: {}", username);
    }
}
