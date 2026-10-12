package com.consego.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthRequest {

    private String username;

    private String correo;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    private String nombres;

    private String apellidos;

    private String rol; // Opcional (por defecto: 'Solicitante')
}
