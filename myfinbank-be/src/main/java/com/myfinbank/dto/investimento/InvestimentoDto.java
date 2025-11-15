package com.myfinbank.dto.investimento;

import com.myfinbank.entity.Investimento;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class InvestimentoDto {
    private Long id;
    private String identificativo;
    private String tipoInvestimento;
    private BigDecimal importoInvestito;
    private BigDecimal tassoRitornoPrevisto;
    private String statoInvestimento;
    private LocalDateTime dataInizio = LocalDateTime.now();
    private LocalDateTime dataFine;
    private int mesi;

    public static InvestimentoDto fromEntity(Investimento inv){
        InvestimentoDto dto = new InvestimentoDto();
        dto.setId(inv.getId());
        dto.setIdentificativo(inv.getIdentificativo());
        dto.setTipoInvestimento(inv.getTipoInvestimento());
        dto.setImportoInvestito(inv.getImportoInvestito());
        dto.setTassoRitornoPrevisto(inv.getTassoRitornoPrevisto());
        dto.setStatoInvestimento(inv.getStatoInvestimento());
        dto.setDataInizio(inv.getDataInizio());
        dto.setDataFine(inv.getDataFine());
        dto.setMesi(inv.getMesi());
        return dto;
    }
}
