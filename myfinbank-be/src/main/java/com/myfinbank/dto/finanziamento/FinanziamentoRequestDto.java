package com.myfinbank.dto.finanziamento;

import com.myfinbank.entity.Finanziamento;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class FinanziamentoRequestDto {

    private Long id;
    private String numeroPratica;
    private BigDecimal importoRichiesto;
    private BigDecimal importoTotale;
    private int durataMesi;
    private BigDecimal tassoInteresse;
    private LocalDateTime dataCreazione;
    private LocalDateTime dataChiusura;
    private String motivoFinanziamento;
    private String stato;
    private String motivoRifiuto;

    public static FinanziamentoRequestDto fromEntity(Finanziamento fin) {
        FinanziamentoRequestDto dto = new FinanziamentoRequestDto();
        dto.setId(fin.getId());
        dto.setNumeroPratica(fin.getNumeroPratica());
        dto.setImportoRichiesto(fin.getImportoRichiesto());
        dto.setImportoTotale(fin.getImportoTotale());
        dto.setDurataMesi(fin.getDurataMesi());
        dto.setTassoInteresse(fin.getTassoInteresse());
        dto.setDataCreazione(fin.getDataCreazione());
        dto.setDataChiusura(fin.getDataChiusura());
        dto.setMotivoFinanziamento(fin.getMotivoFinanziamento());
        dto.setStato(fin.getStato());
        dto.setMotivoRifiuto(fin.getMotivoRifiuto());
        return dto;
    }

}
