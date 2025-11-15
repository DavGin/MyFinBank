package com.myfinbank.controller;

import com.myfinbank.dto.PasswordUpdateRequest;
import com.myfinbank.dto.ProfileUpdateRequest;
import com.myfinbank.dto.UserProfileDto;
import com.myfinbank.entity.User;

import com.myfinbank.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/profile")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private User getCurrentUser( UserDetails userDetails) {

        User user = userService.getProfile(userDetails.getUsername());
        if (user == null) {
            throw new RuntimeException("Utente non trovato");
        }
        return user;
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalArgumentException("UserDetails è nullo nel SecurityContext");
        }
        User user = getCurrentUser(userDetails);
        String username = user.getUsername();
        return ResponseEntity.ok().body(UserProfileDto.fromEntity(userService.getProfile(username)));
    }


    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserProfileDto> getAllUsers() {
        return userService.findAll();
    }


    @PostMapping("/updateProfile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public UserProfileDto updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileUpdateRequest request) {
        if (userDetails == null) {
            throw new RuntimeException("UserDetails è nullo nel SecurityContext");
        }
        User user = getCurrentUser(userDetails);
        String username = user.getUsername();
        return UserProfileDto.fromEntity(userService.updateProfile(username, request));
    }

    @PostMapping("/updatePassword")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public String updatePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PasswordUpdateRequest request) {
        User user = getCurrentUser(userDetails);
        String username = user.getUsername();
        userService.updatePassword(username, request);
        return "Password aggiornata con successo";
    }

}
