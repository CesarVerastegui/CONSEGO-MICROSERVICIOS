package com.consego.audit.consumer;

import com.consego.audit.dto.SolicitudAuditEvent;
import com.consego.audit.model.AuditLog;
import com.consego.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Consumidor de eventos de RabbitMQ para audit-service.
 * Escucha la cola "consego.audit.queue" de manera asíncrona,
 * mapea el evento entrante al documento NoSQL AuditLog y lo persiste en MongoDB.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditEventListener {

    private final AuditLogRepository auditLogRepository;

    /**
     * Consume eventos emitidos desde solicitudes-service y los registra en MongoDB.
     *
     * @param evento Objeto deserializado automáticamente desde el JSON del mensaje AMQP.
     */
    @RabbitListener(queues = "consego.audit.queue")
    public void recibirEvento(SolicitudAuditEvent evento) {
        log.info("Mensaje AMQP recibido en 'consego.audit.queue': tipoEvento={}, entidadId={}, usuarioId={}, detalle={}",
                evento.getTipoEvento(), evento.getEntidadId(), evento.getUsuarioId(), evento.getDetalle());

        AuditLog auditLog = AuditLog.builder()
                .tipoEvento(evento.getTipoEvento())
                .entidadId(evento.getEntidadId())
                .usuarioId(evento.getUsuarioId())
                .fechaEvento(evento.getFechaEvento() != null ? evento.getFechaEvento() : LocalDateTime.now())
                .detalle(evento.getDetalle())
                .build();

        AuditLog guardado = auditLogRepository.save(auditLog);
        log.info("Registro de auditoría persistido con éxito en MongoDB. Document ID={}", guardado.getId());
    }
}
