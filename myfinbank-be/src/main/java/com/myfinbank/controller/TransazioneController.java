package com.myfinbank.controller;

import com.myfinbank.dto.PaginatedTransazioniDto;
import com.myfinbank.dto.TransazioneDto;
import com.myfinbank.service.TransazioneService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/transazioni")
public class TransazioneController {

    private final TransazioneService transazioneService;

    public TransazioneController(TransazioneService transazioneService) {
        this.transazioneService = transazioneService;
    }

    @PostMapping("/creaTransazione")
    public ResponseEntity<TransazioneDto> creaTransazione(
            @Valid @RequestBody TransazioneDto transazioneDto) {
        TransazioneDto nuovaTransazione = transazioneService.creaTransazione(transazioneDto);
        return ResponseEntity.ok(nuovaTransazione);
    }

    @GetMapping("/listTransazioni/{numeroConto}")
    public ResponseEntity<PaginatedTransazioniDto> listTransazioni( @PathVariable String numeroConto,
                                                                 @RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "5") int size) {
        PaginatedTransazioniDto transazioni = transazioneService.listTransazioni(numeroConto, page, size);
        return ResponseEntity.ok(transazioni);
    }

    @GetMapping("/listTransazioniCarta/{numeroCarta}")
    public ResponseEntity<PaginatedTransazioniDto> listTransazioniCarta( @PathVariable String numeroCarta,
                                                                    @RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "5") int size) {
        PaginatedTransazioniDto transazioni = transazioneService.listTransazioniCarta(numeroCarta, page, size);
        return ResponseEntity.ok(transazioni);
    }

    @GetMapping("/dettaglioTransazione/{id}")
    public ResponseEntity<TransazioneDto> dettaglioTransazione(@PathVariable long id) {
        TransazioneDto transazioni = transazioneService.findById(id);
        return ResponseEntity.ok(transazioni);
    }
}
