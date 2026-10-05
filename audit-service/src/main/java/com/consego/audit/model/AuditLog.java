package com.consego.audit.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * Documento NoSQL AuditLog para persistir la trazabilidad histórica de eventos en MongoDB.
 * Implementa el patrón de Persistencia Políglota (Polyglot Persistence):
 * - Microservicios transaccionales (auth, solicitudes): MySQL (Relacional / ACID)
 * - Microservicio de auditoría y telemetría (audit): MongoDB (NoSQL Documental)
 */
@Document(collection = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    private String id;

    @Field("tipo_evento")
    private String tipoEvento; // SOLICITUD_CREADA, SOLICITUD_ACTUALIZADA, SOLICITUD_ELIMINADA

    @Field("entidad_id")
    private Long entidadId;

    @Field("usuario_id")
    private Long usuarioId;

    @Field("fecha_evento")
    @Builder.Default
    private LocalDateTime fechaEvento = LocalDateTime.now();

    @Field("detalle")
    private String detalle;
}
