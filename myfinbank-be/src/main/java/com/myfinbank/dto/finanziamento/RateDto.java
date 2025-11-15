package com.myfinbank.dto.finanziamento;

import com.myfinbank.entity.RateCalcolate;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class RateDto {

    private int numeroRata;
    private LocalDateTime scadenza;
    private BigDecimal quotaCapitale;
    private BigDecimal interessi;
    private BigDecimal rataTotale;
    private BigDecimal saldoRimanente;
    private String statoRata;

    public static RateDto fromEntity(RateCalcolate rateCalcolate) {
        RateDto rateDto = new RateDto();
        rateDto.setNumeroRata(rateCalcolate.getNumeroRata());
        rateDto.setScadenza(rateCalcolate.getScadenza());
        rateDto.setQuotaCapitale(rateCalcolate.getQuotaCapitale());
        rateDto.setInteressi(rateCalcolate.getInteressi());
        rateDto.setRataTotale(rateCalcolate.getRataTotale());
        rateDto.setSaldoRimanente(rateCalcolate.getSaldoRimanente());
        rateDto.setStatoRata(rateCalcolate.getStatoRata());
        return rateDto;
    }

    public static List<RateDto> fromEntityList(List<RateCalcolate> rateCalcolate) {
        return rateCalcolate.stream()
                .map(RateDto::fromEntity)
                .collect(Collectors.toList());
    }
}
