package com.consego.solicitudes.client;

import com.consego.solicitudes.dto.UserResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Fallback de resiliencia para AuthClient.
 * Retorna una respuesta degradada segura ante caídas de red o indisponibilidad de auth-service.
 */
@Component
@Slf4j
public class AuthClientFallback implements AuthClient {

    @Override
    public UserResponse getUserById(Long id) {
        log.warn("ACTIVANDO FALLBACK FEIGN: auth-service no disponible para consultar usuario ID {}. " +
                "Retornando respuesta degradada segura.", id);

        return UserResponse.builder()
                .id(id)
                .username("Desconocido (Modo Resiliente)")
                .rol("GUEST")
                .activo(false)
                .exists(false)
                .build();
    }
}
