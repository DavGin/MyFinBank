package com.myfinbank.dto.investimento;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreaInvestimentoDto {

    private String numeroConto;

    @NotNull
    private String tipoInvestimento; // es: "AZIONI", "CRIPTO", ecc.

    @NotNull
    @Min(1)
    private BigDecimal importoInvestito;

    @NotNull
    private BigDecimal tassoRitornoPrevisto;

    @NotNull
    private Integer durataMesi;

    @NotNull
    private String simboloMercato; // <-- nuovo campo (es. "AAPL", "BTC", "SP500")
}
