package com.consego.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO que mapea el evento de auditoría recibido desde RabbitMQ.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudAuditEvent implements Serializable {

    private String tipoEvento;           // SOLICITUD_CREADA, SOLICITUD_ACTUALIZADA, SOLICITUD_ELIMINADA
    private Long entidadId;              // ID de la entidad (solicitud)
    private Long usuarioId;              // ID del usuario solicitante
    private LocalDateTime fechaEvento;   // Timestamp del evento
    private String detalle;              // Información descriptiva
}
