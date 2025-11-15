package com.myfinbank.dto.investimento;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class SimulazioneInvestimentoDto {

    private BigDecimal importoIniziale;
    private BigDecimal tassoPrevisto; // % annuo
    private int mesi;
}
