package pe.edu.unmsm.fisi.techeng.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Technical English Platform API")
                        .description("Sistema de recomendación para el Aprendizaje de Inglés Técnico Básico")
                        .version("0.1.0")
                        .contact(new Contact()
                                .name("UNMSM FISI")
                                .url("https://github.com/unmsm-io/technical-english")));
    }
}
