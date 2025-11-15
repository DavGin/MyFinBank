package com.myfinbank.utils;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.YearMonth;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;

public class YearMonthDeserializerMMYY extends JsonDeserializer<YearMonth> {
    private static final java.time.format.DateTimeFormatter FORMATTER =
            new DateTimeFormatterBuilder()
                    .appendPattern("MM/")
                    // interpreta yy come anno ridotto base 2000 (00->2000, 30->2030)
                    .appendValueReduced(ChronoField.YEAR, 2, 2, 2000)
                    .toFormatter();

    @Override
    public YearMonth deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getText();
        if (text == null || text.isBlank()) return null;
        return YearMonth.parse(text, FORMATTER);
    }
}
