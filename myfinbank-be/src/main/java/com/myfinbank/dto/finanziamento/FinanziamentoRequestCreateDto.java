package com.myfinbank.dto.finanziamento;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;


@Getter
@Setter
public class FinanziamentoRequestCreateDto {

    @NotNull
    @Min(value = 1)
    private BigDecimal importo;

    @NotNull
    @Min(value = 1)
    private int durataMesi;

    @NotNull
    @Min(value = 0)
    private BigDecimal tassoInteresse;

    private String motivoFinanziamento;



}
