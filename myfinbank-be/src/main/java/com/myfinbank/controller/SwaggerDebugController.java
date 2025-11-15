package com.myfinbank.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SwaggerDebugController {

    private static final Logger logger = LoggerFactory.getLogger(SwaggerDebugController.class);

    @GetMapping("/swagger-debug")
    public String swaggerDebug() {
        logger.debug("Accesso effettuato alla pagina Swagger UI tramite '/swagger-debug'");
        return "Controlla Swagger API Definition su /v3/api-docs o /swagger-ui";
    }
}
