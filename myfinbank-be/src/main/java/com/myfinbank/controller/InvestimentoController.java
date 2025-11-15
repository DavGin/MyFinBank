package com.myfinbank.controller;

import com.myfinbank.dto.investimento.*;
import com.myfinbank.service.InvestimentoService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/investimento")
public class InvestimentoController {

    private final InvestimentoService investimentoService;

    public InvestimentoController(InvestimentoService investimentoService) {
        this.investimentoService = investimentoService;
    }

    @PostMapping("/createInvestimento")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public InvestimentoDto createInvestimento(@Valid @RequestBody CreaInvestimentoDto dto) {
        return investimentoService.createInvestment(dto);
    }

    @GetMapping("/{identificativo}/rendimenti")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<RendimentoDto> getRendimenti(@PathVariable String identificativo) {
        return investimentoService.calcolaRendimenti(identificativo);
    }

    @GetMapping("/getUserInvestments")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<InvestimentoDto> getUserInvestments() {
        return investimentoService.getListaInvestimentiAttivi();
    }

    @PostMapping("/chiudiInvestimento/{identificativo}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public InvestimentoDto chiudiInvestimento(@PathVariable String identificativo) {
        return investimentoService.chiudiInvestimento(identificativo);
    }

    @GetMapping("/proiezioneInvestimento/{identificativo}/{mesi}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ProiezioneInvestimentoDto proiezioneInvestimento(
            @PathVariable String identificativo ,
            @RequestParam(defaultValue = "5") int mesi
    ) {
        return investimentoService.proiezioneInvestimento(identificativo, mesi);
    }

    @PostMapping("/simulaInvestimento")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public SimulazioneInvestimentoOutputDto simulaInvestimento(@Valid @RequestBody SimulazioneInvestimentoDto request) {
        return investimentoService.simulaInvestimento(request);
    }

    @PostMapping("/getStoricoRendimenti/{identificativo}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<RendimentoInvestimentoDto> getStoricoRendimenti(@PathVariable String identificativo) {
        return investimentoService.getStoricoRendimenti(identificativo);
    }
}
