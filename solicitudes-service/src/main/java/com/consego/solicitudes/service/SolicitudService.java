package com.consego.solicitudes.service;

import com.consego.solicitudes.client.AuthClient;
import com.consego.solicitudes.config.RabbitMQConfig;
import com.consego.solicitudes.dto.SolicitudAuditEvent;
import com.consego.solicitudes.dto.UserResponse;
import com.consego.solicitudes.model.Solicitud;
import com.consego.solicitudes.repository.SolicitudRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final AuthClient authClient;
    private final RabbitTemplate rabbitTemplate;

    @PostConstruct
    public void seedSolicitudes() {
        if (solicitudRepository.count() == 0) {
            log.info("Sembrando solicitudes de prueba iniciales...");
            List<Solicitud> iniciales = List.of(
                    Solicitud.builder()
                            .plataforma("Amazon Web Services (AWS)")
                            .motivo("Subir el jar del backend a una instancia EC2 para probar que responda el gateway")
                            .estado("APROBADA")
                            .usuarioSolicitanteId(3L)
                            .fechaCreacion(LocalDateTime.now().minusDays(4))
                            .comentarioResolucion("Aprobado para pruebas del sprint")
                            .vigenciaDias(15)
                            .fechaCaducidad(LocalDateTime.now().plusDays(11))
                            .detallesServicio(Map.of("recurso_rol", "Instancia EC2 Backend", "region_aws", "us-east-1 (N. Virginia)", "ambiente", "Desarrollo"))
                            .build(),
                    Solicitud.builder()
                            .plataforma("GitHub Enterprise")
                            .motivo("Permiso de escritura en el repo del microservicio auth para subir el fix del login")
                            .estado("APROBADA")
                            .usuarioSolicitanteId(4L)
                            .fechaCreacion(LocalDateTime.now().minusDays(3))
                            .comentarioResolucion("Acceso concedido al repositorio")
                            .vigenciaDias(30)
                            .fechaCaducidad(LocalDateTime.now().plusDays(27))
                            .detallesServicio(Map.of("repositorio", "consego/auth-service", "nivel_permiso", "Escritura (Write)"))
                            .build(),
                    Solicitud.builder()
                            .plataforma("VPN Corporativa & Red Segura")
                            .motivo("Conectarme a la red del laboratorio desde mi casa para hacer pruebas con la base de datos")
                            .estado("PENDIENTE")
                            .usuarioSolicitanteId(5L)
                            .fechaCreacion(LocalDateTime.now().minusDays(1))
                            .vigenciaDias(7)
                            .fechaCaducidad(LocalDateTime.now().plusDays(6))
                            .detallesServicio(Map.of("ip_host", "10.200.4.15", "puerto_servicio", "MySQL 3306", "segmento_red", "Red Interna Corporativa"))
                            .build(),
                    Solicitud.builder()
                            .plataforma("Google Cloud Platform (GCP)")
                            .motivo("Probar el despliegue del contenedor en Cloud Run antes de la entrega")
                            .estado("PENDIENTE")
                            .usuarioSolicitanteId(3L)
                            .fechaCreacion(LocalDateTime.now())
                            .vigenciaDias(10)
                            .fechaCaducidad(LocalDateTime.now().plusDays(10))
                            .detallesServicio(Map.of("detalle_recurso", "Google Cloud Run / Artifact Registry"))
                            .build(),
                    Solicitud.builder()
                            .plataforma("Microsoft Azure")
                            .motivo("Revisar los logs en Azure Monitor porque se cayo una instancia durante la prueba")
                            .estado("APROBADA")
                            .usuarioSolicitanteId(6L)
                            .fechaCreacion(LocalDateTime.now().minusDays(2))
                            .comentarioResolucion("Revisado con el equipo de soporte")
                            .vigenciaDias(5)
                            .fechaCaducidad(LocalDateTime.now().plusDays(3))
                            .detallesServicio(Map.of("detalle_recurso", "Log Analytics Workspace"))
                            .build(),
                    Solicitud.builder()
                            .plataforma("Oracle Autonomous DB")
                            .motivo("Crear las tablas de prueba con el script SQL del profe para validar la migracion")
                            .estado("RECHAZADA")
                            .usuarioSolicitanteId(4L)
                            .fechaCreacion(LocalDateTime.now().minusDays(2))
                            .comentarioResolucion("Primero deben validar el script en MySQL local antes de tocar Oracle")
                            .vigenciaDias(0)
                            .detallesServicio(Map.of("esquema_bd", "BD_PRUEBAS_DSW2", "tipo_privilegio", "Escritura (DML)"))
                            .build(),
                    Solicitud.builder()
                            .plataforma("VPN Corporativa & Red Segura")
                            .motivo("Acceso SSH a la maquina virtual para configurar RabbitMQ a mano")
                            .estado("APROBADA")
                            .usuarioSolicitanteId(6L)
                            .fechaCreacion(LocalDateTime.now().minusDays(1))
                            .comentarioResolucion("Habilitado temporalmente por 48 horas")
                            .vigenciaDias(2)
                            .fechaCaducidad(LocalDateTime.now().plusDays(1))
                            .detallesServicio(Map.of("ip_host", "192.168.1.120", "puerto_servicio", "SSH 22", "segmento_red", "Zona DMZ Servidores"))
                            .build(),
                    Solicitud.builder()
                            .plataforma("GitHub Enterprise")
                            .motivo("Acceso al repo del frontend para hacer el merge de la rama v3.0")
                            .estado("PENDIENTE")
                            .usuarioSolicitanteId(5L)
                            .fechaCreacion(LocalDateTime.now().minusHours(3))
                            .vigenciaDias(14)
                            .fechaCaducidad(LocalDateTime.now().plusDays(14))
                            .detallesServicio(Map.of("repositorio", "consego/frontend-angular", "nivel_permiso", "Mantenimiento (Maintain)"))
                            .build()
            );
            solicitudRepository.saveAll(iniciales);
            log.info("Se sembraron {} solicitudes de prueba iniciales.", iniciales.size());
        }
    }

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
