package com.consego.solicitudes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que mapea la respuesta de /api/auth/users/{id} consumida vía OpenFeign.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String rol;
    private boolean activo;
    private boolean exists;
}
