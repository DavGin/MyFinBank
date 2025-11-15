package com.myfinbank.dto.finanziamento;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class SimulazioneFinanziamentoDto {

    @NotNull
    @Min(1)
    private BigDecimal importo;

    @NotNull
    @Min(1)
    private Integer durataMesi;

    @NotNull
    @Min(0)
    private BigDecimal tassoInteresse;

    private String motivo;

}
