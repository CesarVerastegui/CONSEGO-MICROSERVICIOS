package com.consego.solicitudes.dto;

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
public class SolicitudAuditEvent implements Serializable {

    private String tipoEvento;
    private Long entidadId;
    private Long usuarioId;
    private LocalDateTime fechaEvento;
    private String detalle;
    private java.util.Map<String, Object> metadatos;
}
