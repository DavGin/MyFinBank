package com.myfinbank.controller;

import com.myfinbank.dto.ContoDto;
import com.myfinbank.entity.User;
import com.myfinbank.service.ContoService;
import com.myfinbank.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/conti")
@Tag(name = "Gestione conti", description = "Gestione dei conti associati all'utente")
public class ContoController {

    private final ContoService service;
    private final UserService userService;

    public ContoController(ContoService service , UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    @GetMapping("/listaConti")
    @Operation(summary = "Lista conti associati all'utente")
    public ResponseEntity<List<ContoDto>> list(@AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        User user = userService.getProfile(username);
        List<ContoDto> listaConti = service.listConti(user.getUsername());
        return ResponseEntity.ok().body(listaConti);
    }

    @PostMapping("/createConto")
    @Operation(summary = "Apri nuovo conto")
    public ResponseEntity<?> create(@AuthenticationPrincipal UserDetails userDetails,
                                    @Valid @RequestBody ContoDto dto) {
        service.createConto(userDetails.getUsername(), dto);
        return ResponseEntity.status(201).build();
    }

    @GetMapping("/findByNumeroConto/{numeroConto}")
    @Operation(summary = "Trova conto per numero")
    public ResponseEntity<ContoDto> findByNumeroConto(@PathVariable String numeroConto) {
        ContoDto conto = service.findByNumeroConto(numeroConto);
        return ResponseEntity.ok(conto);
    }

    @GetMapping("/chiudiConto/{numeroConto}")
    @Operation(summary = "Chiudi un conto specifico")
    public ResponseEntity<?> chiudiConto(@PathVariable String numeroConto) {
        service.chiudiConto(numeroConto);
        return ResponseEntity.ok().build();
    }

}
