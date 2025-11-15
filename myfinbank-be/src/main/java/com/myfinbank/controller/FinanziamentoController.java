package com.myfinbank.controller;


import com.myfinbank.dto.PagaRataDto;
import com.myfinbank.dto.finanziamento.*;
import com.myfinbank.service.FinanziamentoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/finanziamenti")
public class FinanziamentoController {

    private final FinanziamentoService finanziamentoService;

    public FinanziamentoController(FinanziamentoService finanziamentoService) {
        this.finanziamentoService = finanziamentoService;
    }

    @PostMapping("/createFinanziamento")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public FinanziamentoRequestDto createFinanziamento(@Valid @RequestBody FinanziamentoRequestCreateDto dto) {
        FinanziamentoRequestDto finanziamentoRequestDto = finanziamentoService.createFinanziamentoRequest(dto);
        return finanziamentoRequestDto;
    }

    @GetMapping("/listFinanziamentiUtente")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<FinanziamentoRequestDto> listFinanziamentiUtente() {
        return finanziamentoService.listMutuiUtente();
    }

    @GetMapping("/getFinanziamento/{numeroPratica}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public FinanziamentoRequestDto getFinanziamento(@PathVariable String numeroPratica) {
        return finanziamentoService.getFinanziamento(numeroPratica);
    }


//    @GetMapping("/calcolaRata/{numeroPratica}")
//    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
//    public List<RateDto> calcolaRata(@PathVariable String numeroPratica) {
//        return finanziamentoService.calcolaRata(numeroPratica);
//    }

    @PostMapping("/simulatoreFinanziamento")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<RateDto> simulatoreFinanziamento(@Valid @RequestBody SimulazioneFinanziamentoDto request) {
        return finanziamentoService.simulatoreFinanziamento(request);
    }

    @PostMapping("/pagaRata")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> pagaRata(@RequestBody PagaRataDto pagaRataDto) {
        finanziamentoService.pagaRata(pagaRataDto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/findByNumeroPratica/{numeroPratica}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<RateDto> findByNumeroPratica(@PathVariable String numeroPratica) {
        return finanziamentoService.findAllRatesByNumeroPraticaDto(numeroPratica);
    }

}
