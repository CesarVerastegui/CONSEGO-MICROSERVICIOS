package com.consego.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAuditEvent implements Serializable {
    private String tipoEvento;
    private Long entidadId;
    private Long usuarioId;
    private LocalDateTime fechaEvento;
    private String detalle;
}
