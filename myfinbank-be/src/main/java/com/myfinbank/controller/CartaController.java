package com.myfinbank.controller;

import com.myfinbank.dto.CartaDto;
import com.myfinbank.dto.CartaRequest;
import com.myfinbank.entity.User;
import com.myfinbank.service.CartaService;
import com.myfinbank.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carte")
@Tag(name = "Gestione carte", description = "Gestione delle carte associati all'utente")
public class CartaController {

    private final CartaService cartaService;
    private final UserService userService;

    public CartaController(CartaService cartaService, UserService userService) {
        this.cartaService = cartaService;
        this.userService = userService;
    }

    @PostMapping("/aggiungiCarta")
    @Operation(summary = "Apri nuovo carta")
    public ResponseEntity<CartaDto> aggiungiCarta(@AuthenticationPrincipal UserDetails userDetails,
                                                  @Valid @RequestBody CartaRequest cartaRequest) {
        CartaDto cartaDto = cartaService.aggiungiCarta(userDetails.getUsername(), cartaRequest);
        return ResponseEntity.ok().body(cartaDto);
    }

    @GetMapping("/listaCarte")
    @Operation(summary = "Lista conti associati all'utente")
    public ResponseEntity<List<CartaDto>> listaCarte(@AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        User user = userService.getProfile(username);
        List<CartaDto> listaCarte = cartaService.listCarte(user.getUsername());
        return ResponseEntity.ok().body(listaCarte);
    }

    @GetMapping("/findCartaById/{id}")
    @Operation(summary = "Trova carta per id")
    public ResponseEntity<CartaDto> findCartaById(@PathVariable Long id) {
        CartaDto carta = cartaService.findCartaById(id);
        return ResponseEntity.ok(carta);
    }

    @PostMapping("/bloccaCarta/{id}")
    @Operation(summary = "Blocca carta ")
    public ResponseEntity<CartaDto> bloccaCarta(@PathVariable Long id) {
        CartaDto carta = cartaService.bloccaCarta(id);
        return ResponseEntity.ok(carta);
    }

    @PostMapping("/modificaCarta/{id}")
    @Operation(summary = "Blocca carta ")
    public ResponseEntity<CartaDto> modificaCarta(
            @PathVariable Long id,
            @Valid @RequestBody CartaDto dto
    ) {
        CartaDto cartaAggiornata = cartaService.modificaCarta(id, dto);
        if (cartaAggiornata == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(cartaAggiornata);
    }

}
