package com.myfinbank.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PaginatedTransazioniDto {

    private List<TransazioneDto> content;
    private int totalElements;
    private int number;
    private int size;


}
