package com.myfinbank.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
public class MarketDataDto {
    private String symbol;
    private String date;
    private BigDecimal open;
    private BigDecimal close;

    public MarketDataDto(String symbol, String datetime, double open, double close) {
        this.symbol = symbol;
        this.date = datetime;
        this.open = BigDecimal.valueOf(open);
        this.close = BigDecimal.valueOf(close);
    }

    public MarketDataDto() {} // costruttore vuoto richiesto da Jackson
}
