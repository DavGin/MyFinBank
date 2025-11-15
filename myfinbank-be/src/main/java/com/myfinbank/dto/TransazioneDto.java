package com.myfinbank.dto;

import com.myfinbank.entity.Transazione;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class TransazioneDto {
    private Long id;
    private String tipoTransazione;
    private BigDecimal importo;
    private String valuta;
    private String categoria;
    private LocalDateTime dataTransazione;
    private LocalDateTime dataContabile;
    private String descrizione;
    private String numeroConto;
    private String targetIban;
    private String direzione; // "ENTRATA" | "USCITA"
    private String stato;

    public static TransazioneDto fromEntity(Transazione tx) {
        TransazioneDto dto = new TransazioneDto();
        dto.setId(tx.getId());
        dto.setTipoTransazione(tx.getTipoTransazione());
        dto.setImporto(tx.getImporto());
        dto.setValuta(tx.getValuta());
        dto.setDataTransazione(tx.getDataTransazione());
        dto.setDataContabile(tx.getDataContabile());
        dto.setDescrizione(tx.getDescrizione());
        dto.setNumeroConto(tx.getConto().getNumeroConto());
        dto.setDirezione(tx.getDirezione());
        dto.setStato(tx.getStato());
        dto.setCategoria(tx.getCategoria());
        return dto;
    }

    public static List<TransazioneDto> fromEntity(List<Transazione> tx) {
        return tx.stream()
                .map(TransazioneDto::fromEntity)
                .collect(Collectors.toList());
    }
}
