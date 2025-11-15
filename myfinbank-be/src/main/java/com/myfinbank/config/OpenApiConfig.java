package com.myfinbank.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final Logger logger = LoggerFactory.getLogger(OpenApiConfig.class);

    @Bean
    public OpenAPI customOpenAPI() {
        logger.info("Configurazione Swagger/OpenAPI iniziata...");

        final String securitySchemeName = "bearerAuth";

        try {
            // Configurazione principale
            OpenAPI openAPI = new OpenAPI()
                    .info(new Info()
                            .title("MyFinBank API")
                            .description("API REST per la gestione bancaria universitaria MyFinBank")
                            .version("1.0.0")
                            .contact(new Contact()
                                    .name("Team MyFinBank")
                                    .email("support@myfinbank.com")
                                    .url("https://myfinbank.example.com"))
                            .license(new License().name("Apache 2.0").url("http://springdoc.org")))
                    .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                    .components(new Components()
                            .addSecuritySchemes(securitySchemeName,
                                    new SecurityScheme()
                                            .name(securitySchemeName)
                                            .type(SecurityScheme.Type.HTTP)
                                            .scheme("bearer")
                                            .bearerFormat("JWT")));

            logger.info("Configurazione Swagger/OpenAPI completata con successo.");
            return openAPI;

        } catch (Exception ex) {
            logger.error("Errore durante la configurazione di Swagger/OpenAPI: {}", ex.getMessage(), ex);
            throw ex;
        }
    }
}
