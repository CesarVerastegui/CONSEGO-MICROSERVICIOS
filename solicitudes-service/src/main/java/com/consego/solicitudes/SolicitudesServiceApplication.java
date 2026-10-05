package com.consego.solicitudes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * Clase principal de inicio para solicitudes-service.
 * Habilita clientes declarativos OpenFeign con @EnableFeignClients.
 */
@SpringBootApplication
@EnableFeignClients
public class SolicitudesServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SolicitudesServiceApplication.class, args);
    }
}
