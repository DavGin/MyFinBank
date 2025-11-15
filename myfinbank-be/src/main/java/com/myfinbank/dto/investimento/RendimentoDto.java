package com.myfinbank.dto.investimento;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RendimentoDto {
    private String periodo;
    private BigDecimal valoreIniziale;
    private BigDecimal rendimentoMaturato;
    private BigDecimal valoreAttuale;
}
