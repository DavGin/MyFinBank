package com.myfinbank.service;

import com.myfinbank.dto.MarketDataDto;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MarketDataService {

    private static final String API_KEY = "4987723d9aa54356988191973af3a433";
    private static final String BASE_URL = "https://api.twelvedata.com/time_series?symbol=%s&interval=1day&apikey=" + API_KEY;

    private final RestTemplate restTemplate = new RestTemplate();

    // Cache simbolo lista di dati giornalieri
    private final Map<String, List<MarketDataDto>> cache = new ConcurrentHashMap<>();

    // Data di aggiornamento della cache
    private final Map<String, LocalDate> lastUpdate = new ConcurrentHashMap<>();

    private static final List<String> SUPPORTED_SYMBOLS = List.of(
            "SP500", "WORLD", "AAPL", "MSFT", "TSLA", "GOOGL", "AMZN", "BTC"
    );

    public List<MarketDataDto> getMarketData(String symbol) {
        if (!SUPPORTED_SYMBOLS.contains(symbol)) {
            throw new IllegalArgumentException("Simbolo non supportato: " + symbol);
        }

        LocalDate oggi = LocalDate.now();

        // Controlla se esiste la cache e se è aggiornata oggi
        if (cache.containsKey(symbol) && oggi.equals(lastUpdate.get(symbol))) {
            return cache.get(symbol);
        }

        // Se non aggiornata, carica da API
        try {
            List<MarketDataDto> dati = fetchFromApi(symbol);
            cache.put(symbol, dati);
            lastUpdate.put(symbol, oggi);
            return dati;
        } catch (Exception e) {
            // Se fallisce e c'è già cache vecchia, la restituisce comunque
            if (cache.containsKey(symbol)) {
                return cache.get(symbol);
            }
            throw new RuntimeException("Impossibile recuperare i dati di mercato per " + symbol, e);
        }
    }

    private List<MarketDataDto> fetchFromApi(String symbol) {
        String url = String.format(BASE_URL, symbol);
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null || !response.containsKey("values")) {
            return Collections.emptyList();
        }

        List<Map<String, String>> values = (List<Map<String, String>>) response.get("values");
        List<MarketDataDto> marketDataList = new ArrayList<>();

        for (Map<String, String> v : values) {
            marketDataList.add(new MarketDataDto(
                    symbol,
                    v.get("datetime"),
                    Double.parseDouble(v.get("open")),
                    Double.parseDouble(v.get("close"))
            ));
        }
        return marketDataList;
    }

    public List<String> getSupportedSymbols() {
        return SUPPORTED_SYMBOLS;
    }

    // Metodo per aggiornamento forzato (scheduler)
    public void refreshAllSymbols() {
        for (String symbol : SUPPORTED_SYMBOLS) {
            try {
                List<MarketDataDto> dati = fetchFromApi(symbol);
                cache.put(symbol, dati);
                lastUpdate.put(symbol, LocalDate.now());
            } catch (Exception e) {
                // Log e continua
                System.err.println("Errore aggiornando " + symbol + ": " + e.getMessage());
            }
        }
    }
}
