package com.myfinbank.dto;

import com.myfinbank.entity.Conto;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class ContoDto {

    private Long id;
    private String numeroConto;
    private String tipo;
    private String iban;
    private String valuta;
    private BigDecimal saldoDisponibile;
    private BigDecimal saldoContabile;
    private LocalDateTime ultimoAggiornamento;

    public static ContoDto fromEntity(Conto conto) {
        ContoDto dto = new ContoDto();
        dto.setId(conto.getId());
        dto.setNumeroConto(conto.getNumeroConto());
        dto.setTipo(conto.getTipo());
        dto.setIban(conto.getIban());
        dto.setValuta(conto.getValuta());
        dto.setSaldoDisponibile(conto.getSaldoDisponibile());
        dto.setSaldoContabile(conto.getSaldoContabile());
        dto.setUltimoAggiornamento(conto.getUltimoAggiornamento());
        return dto;
    }
    public static List<ContoDto> fromEntityList(List<Conto> conti) {
        return conti.stream()
                .map(ContoDto::fromEntity)
                .collect(Collectors.toList());
    }
}
