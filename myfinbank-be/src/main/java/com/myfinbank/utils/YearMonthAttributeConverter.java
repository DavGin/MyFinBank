package com.myfinbank.utils;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@Converter(autoApply = true)
public class YearMonthAttributeConverter implements AttributeConverter<YearMonth, String> {
    private static final DateTimeFormatter DB_FORMAT = DateTimeFormatter.ofPattern("MM/yy");

    @Override
    public String convertToDatabaseColumn(YearMonth attribute) {
        return attribute == null ? null : attribute.format(DB_FORMAT);
    }

    @Override
    public YearMonth convertToEntityAttribute(String dbData) {
        return dbData == null || dbData.isBlank() ? null : YearMonth.parse(dbData, DB_FORMAT);
    }
}
