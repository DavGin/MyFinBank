package com.myfinbank.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.myfinbank.utils.YearMonthDeserializerMMYY;
import lombok.Getter;
import lombok.Setter;

import java.time.YearMonth;

@Getter
@Setter
public class PagaRataDto {

    private String numeroPratica;
    private int numeroRata;
    private String numeroConto;
    private String numeroCarta;
    @JsonDeserialize(using = YearMonthDeserializerMMYY.class)
    private YearMonth scadenzaCarta;
    private String CVV;

}
