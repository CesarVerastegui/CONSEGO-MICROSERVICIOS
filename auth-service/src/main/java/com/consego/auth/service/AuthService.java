package com.consego.auth.service;

import com.consego.auth.config.RabbitMQConfig;
import com.consego.auth.dto.AuthRequest;
import com.consego.auth.dto.AuthResponse;
import com.consego.auth.dto.UserAuditEvent;
import com.consego.auth.dto.UserResponse;
import com.consego.auth.model.Usuario;
import com.consego.auth.repository.UsuarioRepository;
import com.consego.auth.security.JwtUtil;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RabbitTemplate rabbitTemplate;

    @PostConstruct
    public void seedUsuarios() {
        if (usuarioRepository.count() == 0) {
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .correo("admin@consego.com")
                    .nombres("Administrador")
                    .apellidos("Principal")
                    .password(passwordEncoder.encode("admin123"))
                    .rol("Admin")
                    .activo(true)
                    .estadoAdmision("APROBADA")
                    .fechaRegistro(LocalDateTime.now())
                    .fechaAprobacion(LocalDateTime.now())
                    .build();

            Usuario auditor = Usuario.builder()
                    .username("auditor")
                    .correo("auditor@consego.com")
                    .nombres("Auditor")
                    .apellidos("Seguridad")
                    .password(passwordEncoder.encode("auditor123"))
                    .rol("Auditor")
                    .activo(true)
                    .estadoAdmision("APROBADA")
                    .fechaRegistro(LocalDateTime.now())
                    .fechaAprobacion(LocalDateTime.now())
                    .build();

            Usuario operador = Usuario.builder()
                    .username("operador")
                    .correo("operador@consego.com")
                    .nombres("Carlos")
                    .apellidos("Gómez")
                    .password(passwordEncoder.encode("operador123"))
                    .rol("Solicitante")
                    .activo(true)
                    .estadoAdmision("APROBADA")
                    .fechaRegistro(LocalDateTime.now())
                    .fechaAprobacion(LocalDateTime.now())
                    .build();

            Usuario cesar = Usuario.builder()
                    .username("cverastegui")
                    .correo("cverastegui@consego.com")
                    .nombres("César")
                    .apellidos("Verástegui")
                    .password(passwordEncoder.encode("password123"))
                    .rol("Solicitante")
                    .activo(true)
                    .estadoAdmision("APROBADA")
                    .fechaRegistro(LocalDateTime.now())
                    .fechaAprobacion(LocalDateTime.now())
                    .build();

            Usuario mathias = Usuario.builder()
                    .username("mcastro")
                    .correo("mcastro@consego.com")
                    .nombres("Mathias")
                    .apellidos("Castro")
                    .password(passwordEncoder.encode("password123"))
                    .rol("Solicitante")
                    .activo(true)
                    .estadoAdmision("APROBADA")
                    .fechaRegistro(LocalDateTime.now())
                    .fechaAprobacion(LocalDateTime.now())
                    .build();

            Usuario jorge = Usuario.builder()
                    .username("jramos")
                    .correo("jramos@consego.com")
                    .nombres("Jorge")
                    .apellidos("Ramos")
                    .password(passwordEncoder.encode("password123"))
                    .rol("Solicitante")
                    .activo(true)
                    .estadoAdmision("APROBADA")
                    .fechaRegistro(LocalDateTime.now())
                    .fechaAprobacion(LocalDateTime.now())
                    .build();

            usuarioRepository.saveAll(List.of(admin, auditor, operador, cesar, mathias, jorge));
            log.info("Cuentas iniciales institucionales sembradas en auth-service.");
        }
    }

    @Transactional
    public AuthResponse register(AuthRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("El nombre de usuario es obligatorio");
        }
        if (request.getCorreo() == null || request.getCorreo().isBlank()) {
            throw new IllegalArgumentException("El correo electrónico es obligatorio");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }
        if (request.getNombres() == null || request.getNombres().isBlank()) {
            throw new IllegalArgumentException("Los nombres son obligatorios");
        }
        if (request.getApellidos() == null || request.getApellidos().isBlank()) {
            throw new IllegalArgumentException("Los apellidos son obligatorios");
        }

        String username = request.getUsername().trim();
        String correo = request.getCorreo().trim().toLowerCase();

        if (usuarioRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("El nombre de usuario '" + username + "' ya está registrado");
        }
        if (usuarioRepository.existsByCorreo(correo)) {
            throw new IllegalArgumentException("El correo electrónico '" + correo + "' ya está registrado");
        }

        Usuario usuario = Usuario.builder()
                .username(username)
                .correo(correo)
                .nombres(request.getNombres().trim())
                .apellidos(request.getApellidos().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol("Solicitante")
                .activo(false)
                .estadoAdmision("PENDIENTE")
                .fechaRegistro(LocalDateTime.now())
                .build();

        Usuario guardado = usuarioRepository.save(usuario);

        publicarEvento("USUARIO_REGISTRADO", guardado.getId(), guardado.getId(),
                RabbitMQConfig.ROUTING_KEY_REGISTRADO,
                "Nuevo usuario registrado preliminarmente: @" + guardado.getUsername() + " (" + guardado.getCorreo() + ")");

        return AuthResponse.builder()
                .id(guardado.getId())
                .username(guardado.getUsername())
                .correo(guardado.getCorreo())
                .nombres(guardado.getNombres())
                .apellidos(guardado.getApellidos())
                .rol(guardado.getRol())
                .role(guardado.getRol())
                .activo(false)
                .token(null)
                .mensaje("Registro preliminar exitoso. Tu cuenta debe ser admitida y aprobada por un administrador antes de iniciar sesión.")
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        String identifier = request.getUsername() != null && !request.getUsername().isBlank()
                ? request.getUsername().trim()
                : (request.getCorreo() != null ? request.getCorreo().trim() : null);

        if (identifier == null || identifier.isBlank()) {
            throw new BadCredentialsException("Debe ingresar su nombre de usuario o correo electrónico");
        }

        Usuario usuario = usuarioRepository.findByUsernameOrCorreo(identifier, identifier)
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas: usuario o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new BadCredentialsException("Credenciales inválidas: usuario o contraseña incorrectos");
        }

        if ("RECHAZADA".equalsIgnoreCase(usuario.getEstadoAdmision())) {
            String motivo = (usuario.getMotivoRechazo() != null && !usuario.getMotivoRechazo().isBlank())
                    ? usuario.getMotivoRechazo()
                    : "Solicitud no aprobada por el área de seguridad";
            throw new BadCredentialsException("Tu solicitud de registro fue rechazada por un administrador. Motivo: " + motivo);
        }

        if (!usuario.isActivo() || "PENDIENTE".equalsIgnoreCase(usuario.getEstadoAdmision())) {
            throw new BadCredentialsException("Tu cuenta se encuentra registrada preliminarmente y está pendiente de aprobación por un administrador.");
        }

        String token = jwtUtil.generateToken(usuario);

        return AuthResponse.builder()
                .token(token)
                .id(usuario.getId())
                .username(usuario.getUsername())
                .correo(usuario.getCorreo())
                .nombres(usuario.getNombres())
                .apellidos(usuario.getApellidos())
                .rol(usuario.getRol())
                .role(usuario.getRol())
                .activo(usuario.isActivo())
                .type("Bearer")
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return usuarioRepository.findById(id)
                .map(this::mapToUserResponse)
                .orElse(UserResponse.builder().id(id).exists(false).build());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listarUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    @Transactional
    public UserResponse crearUsuarioAdmin(AuthRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("El nombre de usuario es obligatorio");
        }
        if (request.getCorreo() == null || request.getCorreo().isBlank()) {
            throw new IllegalArgumentException("El correo electrónico es obligatorio");
        }
        String username = request.getUsername().trim();
        String correo = request.getCorreo().trim().toLowerCase();

        if (usuarioRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("El nombre de usuario '" + username + "' ya existe");
        }
        if (usuarioRepository.existsByCorreo(correo)) {
            throw new IllegalArgumentException("El correo electrónico '" + correo + "' ya existe");
        }

        Usuario usuario = Usuario.builder()
                .username(username)
                .correo(correo)
                .nombres(request.getNombres() != null ? request.getNombres().trim() : "")
                .apellidos(request.getApellidos() != null ? request.getApellidos().trim() : "")
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol() != null && !request.getRol().isBlank() ? request.getRol() : "Solicitante")
                .activo(true)
                .estadoAdmision("APROBADA")
                .fechaRegistro(LocalDateTime.now())
                .fechaAprobacion(LocalDateTime.now())
                .build();

        Usuario guardado = usuarioRepository.save(usuario);

        publicarEvento("USUARIO_APROBADO", guardado.getId(), guardado.getId(),
                RabbitMQConfig.ROUTING_KEY_APROBADO,
                "Usuario @" + guardado.getUsername() + " (" + guardado.getRol() + ") creado directamente por el Administrador");

        return mapToUserResponse(guardado);
    }

    @Transactional
    public UserResponse aprobarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        usuario.setActivo(true);
        usuario.setEstadoAdmision("APROBADA");
        usuario.setFechaAprobacion(LocalDateTime.now());
        usuario.setMotivoRechazo(null);
        Usuario guardado = usuarioRepository.save(usuario);

        publicarEvento("USUARIO_APROBADO", guardado.getId(), guardado.getId(),
                RabbitMQConfig.ROUTING_KEY_APROBADO,
                "Usuario @" + guardado.getUsername() + " (" + guardado.getRol() + ") aprobado y admitido por el Administrador");

        return mapToUserResponse(guardado);
    }

    @Transactional
    public UserResponse rechazarUsuario(Long id, String motivo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        usuario.setActivo(false);
        usuario.setEstadoAdmision("RECHAZADA");
        usuario.setMotivoRechazo(motivo != null && !motivo.isBlank() ? motivo.trim() : "No admitido por políticas de seguridad");
        Usuario guardado = usuarioRepository.save(usuario);

        publicarEvento("USUARIO_RECHAZADO", guardado.getId(), guardado.getId(),
                RabbitMQConfig.ROUTING_KEY_RECHAZADO,
                "Admisión de usuario @" + guardado.getUsername() + " rechazada. Motivo: " + guardado.getMotivoRechazo());

        return mapToUserResponse(guardado);
    }

    @Transactional
    public UserResponse actualizarRol(Long id, String nuevoRol) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        usuario.setRol(nuevoRol);
        Usuario guardado = usuarioRepository.save(usuario);
        return mapToUserResponse(guardado);
    }

    @Transactional
    public UserResponse actualizarEstado(Long id, boolean activo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        usuario.setActivo(activo);
        if (activo) {
            usuario.setEstadoAdmision("APROBADA");
            if (usuario.getFechaAprobacion() == null) {
                usuario.setFechaAprobacion(LocalDateTime.now());
            }
        }
        Usuario guardado = usuarioRepository.save(usuario);
        return mapToUserResponse(guardado);
    }

    @Transactional
    public void eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuario no encontrado con ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    private UserResponse mapToUserResponse(Usuario u) {
        return UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .correo(u.getCorreo())
                .nombres(u.getNombres())
                .apellidos(u.getApellidos())
                .rol(u.getRol())
                .activo(u.isActivo())
                .estadoAdmision(u.getEstadoAdmision())
                .motivoRechazo(u.getMotivoRechazo())
                .fechaRegistro(u.getFechaRegistro())
                .fechaAprobacion(u.getFechaAprobacion())
                .exists(true)
                .build();
    }

    private void publicarEvento(String tipoEvento, Long entidadId, Long usuarioId, String routingKey, String detalle) {
        try {
            UserAuditEvent evento = UserAuditEvent.builder()
                    .tipoEvento(tipoEvento)
                    .entidadId(entidadId)
                    .usuarioId(usuarioId)
                    .fechaEvento(LocalDateTime.now())
                    .detalle(detalle)
                    .build();

            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, routingKey, evento);
            log.info("Evento emitido a RabbitMQ: [Exchange={}, RoutingKey={}, TipoEvento={}, EntidadId={}]",
                    RabbitMQConfig.EXCHANGE_NAME, routingKey, tipoEvento, entidadId);
        } catch (Exception ex) {
            log.error("Error al emitir evento de usuario a RabbitMQ: {}", ex.getMessage());
        }
    }
}
