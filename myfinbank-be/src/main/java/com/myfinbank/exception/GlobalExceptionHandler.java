package com.myfinbank.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myfinbank.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.io.IOException;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private final MessageService messageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GlobalExceptionHandler(MessageService messageService) {
        this.messageService = messageService;
    }

    @ExceptionHandler(DisabledException.class)
    public void handleDisabledUser(DisabledException ex,
                                   HttpServletRequest request,
                                   HttpServletResponse response) throws IOException {
        writeErrorResponse(response, HttpStatus.FORBIDDEN,
                messageService.getMessage("access.denied"),
                request.getRequestURI(), ex);
    }

    /** Accesso negato */
    @ExceptionHandler(AccessDeniedException.class)
    public void handleAccessDeniedException(AccessDeniedException ex,
                                            HttpServletRequest request,
                                            HttpServletResponse response) throws IOException {
        writeErrorResponse(response, HttpStatus.FORBIDDEN,
                messageService.getMessage("access.denied"),
                request.getRequestURI(), ex);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public void handleBadCredentials(BadCredentialsException ex,
                                     HttpServletRequest request,
                                     HttpServletResponse response) throws IOException {
        writeErrorResponse(response, HttpStatus.FORBIDDEN,
                messageService.getMessage("auth.failed"),
                request.getRequestURI(), ex);
    }

    /**Autenticazione fallita */
    @ExceptionHandler(AuthenticationException.class)
    public void handleAuthenticationException(AuthenticationException ex,
                                              HttpServletRequest request,
                                              HttpServletResponse response) throws IOException {
        writeErrorResponse(response, HttpStatus.UNAUTHORIZED,
                messageService.getMessage("auth.failed"),
                request.getRequestURI(), ex);
    }

    /** Validazione DTO (@Valid) */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public void handleValidationErrors(MethodArgumentNotValidException ex,
                                       HttpServletRequest request,
                                       HttpServletResponse response) throws IOException {
        String details = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        writeErrorResponse(response, HttpStatus.BAD_REQUEST,
                messageService.getMessage("validation.error"),
                request.getRequestURI(), ex, details);
    }

    /** Validazione parametri */
    @ExceptionHandler(ConstraintViolationException.class)
    public void handleConstraintViolation(ConstraintViolationException ex,
                                          HttpServletRequest request,
                                          HttpServletResponse response) throws IOException {
        writeErrorResponse(response, HttpStatus.BAD_REQUEST,
                messageService.getMessage("validation.error"),
                request.getRequestURI(), ex, ex.getMessage());
    }

    /** Violazione vincolo DB */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public void handleDataIntegrityViolation(DataIntegrityViolationException ex,
                                             HttpServletRequest request,
                                             HttpServletResponse response) throws IOException {
        writeErrorResponse(response, HttpStatus.CONFLICT,
                messageService.getMessage("db.unique.violation"),
                request.getRequestURI(), ex);
    }

    /** Risorsa non trovata */
    @ExceptionHandler(ResourceNotFoundException.class)
    public void handleNotFound(ResourceNotFoundException ex,
                               HttpServletRequest request,
                               HttpServletResponse response) throws IOException {
        writeErrorResponse(response, HttpStatus.NOT_FOUND,
                ex.getMessage(),
                request.getRequestURI(), ex);
    }

    /**Catch-all */
    @ExceptionHandler(Exception.class)
    public void handleAllExceptions(Exception ex,
                                    HttpServletRequest request,
                                    HttpServletResponse response) throws IOException {
        writeErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR,
                messageService.getMessage("error.internal"),
                request.getRequestURI(), ex);
    }

    @ExceptionHandler(EmailAlreadyUsedException.class)
    public void handleEmailAlreadyUsed(EmailAlreadyUsedException ex,
                                       HttpServletRequest request,
                                       HttpServletResponse response) throws IOException {
        writeErrorResponse(response, HttpStatus.CONFLICT,
                messageService.getMessage(ex.getMessage()),
                request.getRequestURI(), ex);
    }

    @ExceptionHandler(UsernameAlreadyUsedException.class)
    public void handleUsernameAlreadyUsed(UsernameAlreadyUsedException ex,
                                          HttpServletRequest request,
                                          HttpServletResponse response) throws IOException {
        writeErrorResponse(response, HttpStatus.CONFLICT,
                messageService.getMessage(ex.getMessage()),
                request.getRequestURI(), ex);
    }

    @ExceptionHandler(SaldoInsufficienteException.class)
    public void handleSaldoInsufficiente(SaldoInsufficienteException ex,
                                         HttpServletRequest request,
                                         HttpServletResponse response) throws IOException {
        writeErrorResponse(response, HttpStatus.BAD_REQUEST,
                messageService.getMessage(ex.getMessage()),
                request.getRequestURI(), ex);
    }

    /** Metodo per costruire la risposta */
    private void writeErrorResponse(HttpServletResponse response,
                                    HttpStatus status,
                                    String message,
                                    String path,
                                    Exception ex) throws IOException {
        writeErrorResponse(response, status, message, path, ex, null);
    }

    private void writeErrorResponse(HttpServletResponse response,
                                    HttpStatus status,
                                    String message,
                                    String path,
                                    Exception ex,
                                    String details) throws IOException {

        logger.error("Gestione eccezione [{}] su {}: {}", ex.getClass().getSimpleName(), path, ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                message,
                path,
                details
        );

        response.setStatus(status.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), errorResponse);
    }
}
