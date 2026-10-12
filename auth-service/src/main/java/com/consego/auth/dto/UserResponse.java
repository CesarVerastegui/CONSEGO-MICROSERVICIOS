package com.consego.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la respuesta de /users/{id} para consumo interno de microservicios (OpenFeign).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String correo;
    private String nombres;
    private String apellidos;
    private String rol;
    private boolean activo;
    private String estadoAdmision;
    private String motivoRechazo;
    private java.time.LocalDateTime fechaRegistro;
    private java.time.LocalDateTime fechaAprobacion;
    private boolean exists;
}
