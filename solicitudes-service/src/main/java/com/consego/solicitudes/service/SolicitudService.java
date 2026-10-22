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

@Service
@RequiredArgsConstructor
@Slf4j
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final AuthClient authClient;
    private final RabbitTemplate rabbitTemplate;

    @Transactional(readOnly = true)
    public List<Solicitud> listarTodas() {
        return listarTodas(null);
    }

    @Transactional(readOnly = true)
    public List<Solicitud> listarTodas(Long usuarioId) {
        if (usuarioId != null) {
            return solicitudRepository.findByUsuarioSolicitanteIdOrderByFechaCreacionDesc(usuarioId);
        }
        return solicitudRepository.findAllByOrderByFechaCreacionDesc();
    }

    @Transactional(readOnly = true)
    public Solicitud obtenerPorId(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la solicitud con ID: " + id));
    }

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

        if (solicitud.getVigenciaDias() != null && solicitud.getVigenciaDias() > 0) {
            solicitud.setFechaCaducidad(LocalDateTime.now().plusDays(solicitud.getVigenciaDias()));
        }

        log.info("Usuario validado: {} (Rol: {}). Guardando solicitud...", user.getUsername(), user.getRol());
        Solicitud guardada = solicitudRepository.save(solicitud);

        String vigenciaStr = guardada.getVigenciaDias() != null
                ? " (Vigencia: " + guardada.getVigenciaDias() + " días)"
                : " (Acceso permanente)";

        String detallesStr = "";
        if (guardada.getDetallesServicio() != null && !guardada.getDetallesServicio().isEmpty()) {
            detallesStr = " | Parámetros: " + guardada.getDetallesServicio();
        }

        publicarEvento("SOLICITUD_CREADA", guardada, "solicitud.creada",
                "Solicitud de acceso registrada para plataforma " + guardada.getPlataforma() + vigenciaStr + detallesStr);

        return guardada;
    }

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

    @Transactional
    public Solicitud actualizarEstado(Long id, String nuevoEstado) {
        return actualizarEstado(id, nuevoEstado, null);
    }

    @Transactional
    public Solicitud actualizarEstado(Long id, String nuevoEstado, String comentario) {
        Solicitud existente = obtenerPorId(id);
        existente.setEstado(nuevoEstado);
        if (comentario != null && !comentario.isBlank()) {
            existente.setComentarioResolucion(comentario);
        }

        Solicitud guardada = solicitudRepository.save(existente);

        String detalle = "Estado de solicitud #" + id + " cambiado a " + nuevoEstado +
                (comentario != null && !comentario.isBlank() ? ". Resolución: " + comentario : "");

        publicarEvento("SOLICITUD_ACTUALIZADA", guardada, "solicitud.actualizada", detalle);

        return guardada;
    }

    @Transactional
    public void eliminarSolicitud(Long id) {
        Solicitud existente = obtenerPorId(id);
        solicitudRepository.deleteById(id);
        log.info("Solicitud #{} eliminada exitosamente", id);

        publicarEvento("SOLICITUD_ELIMINADA", existente, "solicitud.eliminada",
                "Solicitud para " + existente.getPlataforma() + " eliminada del sistema");
    }

    private void publicarEvento(String tipoEvento, Solicitud solicitud, String routingKey, String detalle) {
        try {
            SolicitudAuditEvent evento = SolicitudAuditEvent.builder()
                    .tipoEvento(tipoEvento)
                    .entidadId(solicitud.getId())
                    .usuarioId(solicitud.getUsuarioSolicitanteId())
                    .fechaEvento(LocalDateTime.now())
                    .detalle(detalle)
                    .metadatos(solicitud.getDetallesServicio())
                    .build();

            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, routingKey, evento);
            log.info("Evento emitido a RabbitMQ: [Exchange={}, RoutingKey={}, TipoEvento={}, EntidadId={}]",
                    RabbitMQConfig.EXCHANGE_NAME, routingKey, tipoEvento, solicitud.getId());
        } catch (Exception ex) {
            log.error("Error al emitir evento a RabbitMQ: {}", ex.getMessage());
        }
    }
}
