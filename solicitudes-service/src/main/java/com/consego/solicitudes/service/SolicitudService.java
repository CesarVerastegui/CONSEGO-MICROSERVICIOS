package com.consego.solicitudes.service;

import com.consego.solicitudes.client.AuthClient;
import com.consego.solicitudes.config.RabbitMQConfig;
import com.consego.solicitudes.dto.SolicitudAuditEvent;
import com.consego.solicitudes.dto.UserResponse;
import com.consego.solicitudes.model.Solicitud;
import com.consego.solicitudes.repository.SolicitudRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio de lógica de negocio para solicitudes-service según rúbrica:
 * - CRUD completo: listarTodas(), obtenerPorId(), crearSolicitud(), actualizarEstado(), eliminarSolicitud().
 * - Validación sincrónica vía OpenFeign protegida con @CircuitBreaker(name="authServiceCB").
 * - Emisión asíncrona de eventos a RabbitMQ ("SOLICITUD_CREADA", "SOLICITUD_ACTUALIZADA", "SOLICITUD_ELIMINADA").
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final AuthClient authClient;
    private final RabbitTemplate rabbitTemplate;

    /**
     * Listar todas las solicitudes registradas.
     */
    @Transactional(readOnly = true)
    public List<Solicitud> listarTodas() {
        return solicitudRepository.findAll();
    }

    /**
     * Obtener solicitud por ID.
     */
    @Transactional(readOnly = true)
    public Solicitud obtenerPorId(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la solicitud con ID: " + id));
    }

    /**
     * Crear solicitud: Valida existencia del usuario con Feign Client protegido con Circuit Breaker.
     * Al persistir, publica asíncronamente el evento "SOLICITUD_CREADA".
     */
    @Transactional
    @CircuitBreaker(name = "authServiceCB", fallbackMethod = "crearSolicitudFallback")
    public Solicitud crearSolicitud(Solicitud solicitud) {
        log.info("Validando usuario solicitante ID: {} con auth-service vía OpenFeign", solicitud.getUsuarioSolicitanteId());

        UserResponse user = authClient.getUserById(solicitud.getUsuarioSolicitanteId());

        if (user == null || user.getId() == null || !user.isExists() || !user.isActivo()) {
            throw new IllegalArgumentException(
                    "Validación fallida: El usuario solicitante con ID " + solicitud.getUsuarioSolicitanteId() +
                    " no existe, está inactivo o auth-service se encuentra en modo resiliente."
            );
        }

        log.info("Usuario validado: {} (Rol: {}). Guardando solicitud...", user.getUsername(), user.getRol());
        Solicitud guardada = solicitudRepository.save(solicitud);

        // Publicación asíncrona del evento a RabbitMQ
        publicarEvento("SOLICITUD_CREADA", guardada, "solicitud.creada",
                "Solicitud de acceso registrada para plataforma " + guardada.getPlataforma());

        return guardada;
    }

    /**
     * Método Fallback invocado si el circuito authServiceCB está abierto o falla la comunicación.
     */
    public Solicitud crearSolicitudFallback(Solicitud solicitud, Throwable throwable) {
        if (throwable instanceof IllegalArgumentException) {
            throw (IllegalArgumentException) throwable;
        }
        log.error("Circuit Breaker [authServiceCB] activado: {}", throwable.getMessage());
        throw new IllegalStateException(
                "Degradación Elegante: El servicio de autenticación no está disponible en este momento. " +
                "El circuito authServiceCB está protegiendo la transacción. Intente más tarde."
        );
    }

    /**
     * Actualizar estado de una solicitud (Aprobada, Rechazada, etc.).
     * Publica asíncronamente el evento "SOLICITUD_ACTUALIZADA".
     */
    @Transactional
    public Solicitud actualizarEstado(Long id, String nuevoEstado) {
        Solicitud existente = obtenerPorId(id);
        existente.setEstado(nuevoEstado);

        Solicitud guardada = solicitudRepository.save(existente);

        // Publicación asíncrona del evento
        publicarEvento("SOLICITUD_ACTUALIZADA", guardada, "solicitud.actualizada",
                "Estado de solicitud cambiado a " + nuevoEstado);

        return guardada;
    }

    /**
     * Eliminar solicitud por ID.
     * Publica asíncronamente el evento "SOLICITUD_ELIMINADA".
     */
    @Transactional
    public void eliminarSolicitud(Long id) {
        Solicitud existente = obtenerPorId(id);
        solicitudRepository.deleteById(id);
        log.info("Solicitud #{} eliminada exitosamente", id);

        // Publicación asíncrona del evento
        publicarEvento("SOLICITUD_ELIMINADA", existente, "solicitud.eliminada",
                "Solicitud para " + existente.getPlataforma() + " eliminada del sistema");
    }

    /**
     * Publica el evento de auditoría hacia el TopicExchange 'consego.events.tx'.
     */
    private void publicarEvento(String tipoEvento, Solicitud solicitud, String routingKey, String detalle) {
        try {
            SolicitudAuditEvent evento = SolicitudAuditEvent.builder()
                    .tipoEvento(tipoEvento)
                    .entidadId(solicitud.getId())
                    .usuarioId(solicitud.getUsuarioSolicitanteId())
                    .fechaEvento(LocalDateTime.now())
                    .detalle(detalle)
                    .build();

            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, routingKey, evento);
            log.info("Evento emitido a RabbitMQ: [Exchange={}, RoutingKey={}, TipoEvento={}, EntidadId={}]",
                    RabbitMQConfig.EXCHANGE_NAME, routingKey, tipoEvento, solicitud.getId());
        } catch (Exception ex) {
            log.error("Error al emitir evento a RabbitMQ: {}", ex.getMessage());
        }
    }
}
