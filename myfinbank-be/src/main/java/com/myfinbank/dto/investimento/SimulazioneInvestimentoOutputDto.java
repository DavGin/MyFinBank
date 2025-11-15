package com.myfinbank.dto.investimento;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class SimulazioneInvestimentoOutputDto {

        private BigDecimal importoIniziale;
        private BigDecimal tassoPrevisto;
        private int mesi;
        private BigDecimal importoFinale;

}
