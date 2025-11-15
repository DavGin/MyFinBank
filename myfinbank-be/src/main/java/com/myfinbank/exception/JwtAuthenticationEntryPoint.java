package com.myfinbank.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myfinbank.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final MessageService messageService;

    public JwtAuthenticationEntryPoint(MessageService messageService) {
        this.messageService = messageService;
    }

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        String message;
        int status;

        if (authException instanceof MissingTokenException) {
            message = messageService.getMessage("token.missing");
        } else if (authException instanceof ExpiredTokenException) {
            message = messageService.getMessage("token.expired");
        } else if (authException instanceof InvalidTokenException) {
            message = messageService.getMessage("token.invalid");
        } else {
            message = "Accesso negato";
        }

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", HttpServletResponse.SC_FORBIDDEN);
        errorResponse.put("error", "Forbidden");
        errorResponse.put("message", message);
        errorResponse.put("path", request.getRequestURI());

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        new ObjectMapper().writeValue(response.getWriter(), errorResponse);
    }
}
