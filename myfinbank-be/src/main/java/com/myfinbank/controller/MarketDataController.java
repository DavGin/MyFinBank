package com.myfinbank.controller;


import com.myfinbank.dto.MarketDataDto;
import com.myfinbank.service.MarketDataService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/investimento/market-data")
public class MarketDataController {

    private final MarketDataService marketDataService;

    public MarketDataController(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @GetMapping("/{symbol}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<MarketDataDto> getMarketData(@PathVariable String symbol) {
        return marketDataService.getMarketData(symbol);
    }

    @GetMapping("/symbols")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<String> getSupportedSymbols() {
        return marketDataService.getSupportedSymbols();
    }
}
