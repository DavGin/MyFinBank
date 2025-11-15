package com.myfinbank.dto.investimento;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RendimentoInvestimentoDto {
    private String periodo; // es. "2025-01"
    private BigDecimal valoreIniziale;
    private BigDecimal rendimentoMaturato;
    private BigDecimal valoreAttuale;
}
