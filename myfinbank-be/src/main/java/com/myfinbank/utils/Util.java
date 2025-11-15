package com.myfinbank.utils;

import java.util.stream.Collectors;

public class Util {

    public static String generateIban(String countryCode, String bankCode, String branchCode, String accountNumber) {
        // Concatenare i dati di banca, filiale e conto
        String rawIban = bankCode + branchCode + accountNumber;

        // Aggiungere codice paese e numeri placeholder (00) per calcolo del numero di controllo
        String ibanWithPlaceholder = rawIban + countryCode + "00";

        // Convertire i caratteri del codice paese in numeri (A = 10, ..., Z = 35)
        String countryNumeric = convertToNumeric(countryCode);
        String ibanNumeric = ibanWithPlaceholder.replace(countryCode, countryNumeric);

        // Calcolare il numero di controllo: Modulo 97
        int checkDigits = 98 - modulo97(ibanNumeric);

        // Generare l'IBAN finale
        return countryCode + String.format("%02d", checkDigits) + rawIban;
    }

    /**
     * Converte i caratteri alfabetici di una stringa in rappresentazione numerica 
     * secondo lo standard IBAN (A=10, ..., Z=35).
     *
     * @param input Stringa da convertire.
     * @return Rappresentazione numerica della stringa.
     */
    public static String convertToNumeric(String input) {
        StringBuilder numericRepresentation = new StringBuilder();
        for (char ch : input.toCharArray()) {
            if (Character.isLetter(ch)) {
                numericRepresentation.append(ch - 'A' + 10);
            } else {
                numericRepresentation.append(ch);
            }
        }
        return numericRepresentation.toString();
    }

    /**
     * Calcola il resto della divisione Modulo 97 su una stringa numerica.
     *
     * @param numericIban Stringa numerica rappresentante l'IBAN.
     * @return Resto della divisione Modulo 97.
     */
    public static int modulo97(String numericIban) {
        String remainder = "";
        for (char digit : numericIban.toCharArray()) {
            remainder = (remainder + digit).substring(Math.max(0, remainder.length() - 9));
            long number = Long.parseLong(remainder);
            remainder = String.valueOf(number % 97);
        }
        return Integer.parseInt(remainder);
    }


    public static String generateRandomNumericString(int length) {
        return java.util.stream.IntStream.range(0, length)
                .mapToObj(i -> String.valueOf((int) (Math.random() * 10)))
                .collect(Collectors.joining());
    }

    public static String generaNumeroCarta() {
        // Mock semplice: in reale va cifrato e controllato univocità
        long numero = 4000000000000000L + (long)(Math.random() * 1000000000000000L);
        return String.valueOf(numero);
    }

    public static String generaCvc() {
        int cvc = (int)(Math.random() * 1000);
        return String.format("%03d", cvc);
    }

}
