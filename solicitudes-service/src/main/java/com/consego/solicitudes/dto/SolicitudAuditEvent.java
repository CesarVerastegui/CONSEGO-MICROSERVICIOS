package com.consego.solicitudes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Evento emitido hacia RabbitMQ (Exchange: 'consego.events.tx') ante cambios en solicitudes.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudAuditEvent implements Serializable {

    private String tipoEvento;           // SOLICITUD_CREADA, SOLICITUD_ACTUALIZADA, SOLICITUD_ELIMINADA
    private Long entidadId;              // ID de la solicitud
    private Long usuarioId;              // ID del usuario solicitante
    private LocalDateTime fechaEvento;   // Timestamp de la operación
    private String detalle;              // Información descriptiva adicional
}
