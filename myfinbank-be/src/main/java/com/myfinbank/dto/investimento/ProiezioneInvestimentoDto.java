package com.myfinbank.dto.investimento;

import com.myfinbank.entity.Investimento;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ProiezioneInvestimentoDto {

    private Long id;
    private String identificativo;
    private String tipoInvestimento;
    private BigDecimal importoInvestito;
    private BigDecimal tassoRitornoPrevisto; // es. 5% annuo
    private String statoInvestimento;
    private LocalDateTime dataInizio;
    private LocalDateTime dataFine;
    private int mesi;
    private BigDecimal importoTotale;

    public static ProiezioneInvestimentoDto fromEntity(Investimento inv){
        ProiezioneInvestimentoDto dto = new ProiezioneInvestimentoDto();
        dto.setId(inv.getId());
        dto.setIdentificativo(inv.getIdentificativo());
        dto.setTipoInvestimento(inv.getTipoInvestimento());
        dto.setImportoInvestito(inv.getImportoInvestito());
        dto.setTassoRitornoPrevisto(inv.getTassoRitornoPrevisto());
        dto.setStatoInvestimento(inv.getStatoInvestimento());
        dto.setDataInizio(inv.getDataInizio());
        dto.setDataFine(inv.getDataFine());
        dto.setMesi(inv.getMesi());
        return dto;
    }
}
