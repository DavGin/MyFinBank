package com.myfinbank.service;

import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.context.i18n.LocaleContextHolder;

@Service
public class MessageService {

    private final MessageSource messageSource;

    public MessageService(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    public String getMessage(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }
}
