package com.consego.solicitudes.client;

import com.consego.solicitudes.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Cliente declarativo OpenFeign con tolerancia a fallos mediante Fallback.
 * Consume el endpoint GET /api/auth/users/{id} de auth-service.
 */
@FeignClient(
        name = "auth-service",
        url = "${auth.service.url:}",
        fallback = AuthClientFallback.class
)
public interface AuthClient {

    @GetMapping("/api/auth/users/{id}")
    UserResponse getUserById(@PathVariable("id") Long id);
}
