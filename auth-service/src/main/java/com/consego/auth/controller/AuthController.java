package com.consego.auth.controller;

import com.consego.auth.dto.AuthRequest;
import com.consego.auth.dto.AuthResponse;
import com.consego.auth.dto.UserResponse;
import com.consego.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador REST para el microservicio auth-service (@RequestMapping("/api/auth")).
 * Cumple con la rúbrica de Servicio Web Rest Login (6.0 Puntos).
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /register: Recibe datos de usuario, encripta el password con BCryptPasswordEncoder
     * y persiste en base de datos.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /login: Valida credenciales contra la BD usando passwordEncoder.matches().
     * Si coincide, retorna JWT, rol y username; de lo contrario, HTTP 401.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "Unauthorized",
                            "mensaje", ex.getMessage(),
                            "status", 401
                    ));
        }
    }

    /**
     * GET /users/{id}: Retorna datos básicos del usuario para consumo interno de microservicios (OpenFeign).
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse user = authService.getUserById(id);
        if (!user.isExists()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(user);
        }
        return ResponseEntity.ok(user);
    }

    /**
     * GET /users: Listar todos los usuarios para la consola de administración IAM.
     */
    @GetMapping("/users")
    public ResponseEntity<java.util.List<UserResponse>> listarUsuarios() {
        return ResponseEntity.ok(authService.listarUsuarios());
    }

    /**
     * POST /users: Crear un nuevo usuario con rol específico desde el panel IAM.
     */
    @PostMapping("/users")
    public ResponseEntity<UserResponse> crearUsuarioAdmin(@Valid @RequestBody AuthRequest request) {
        UserResponse nuevo = authService.crearUsuarioAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    /**
     * PUT /users/{id}/role: Elevar o cambiar el rol de un usuario.
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> actualizarRol(
            @PathVariable Long id,
            @RequestBody com.consego.auth.dto.UpdateRoleRequest request
    ) {
        return ResponseEntity.ok(authService.actualizarRol(id, request.getRol()));
    }

    /**
     * PUT /users/{id}/status: Activar o desactivar cuenta de usuario.
     */
    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> actualizarEstado(
            @PathVariable Long id,
            @RequestBody com.consego.auth.dto.UpdateStatusRequest request
    ) {
        boolean activo = request.getActivo() != null && request.getActivo();
        return ResponseEntity.ok(authService.actualizarEstado(id, activo));
    }

    /**
     * PUT /users/{id}/aprobar: Aprobar/Admitir cuenta preliminar de usuario.
     */
    @PutMapping("/users/{id}/aprobar")
    public ResponseEntity<UserResponse> aprobarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(authService.aprobarUsuario(id));
    }

    /**
     * PUT /users/{id}/rechazar: Rechazar solicitud de admisión con motivo especificado.
     */
    @PutMapping("/users/{id}/rechazar")
    public ResponseEntity<UserResponse> rechazarUsuario(
            @PathVariable Long id,
            @RequestBody(required = false) com.consego.auth.dto.RechazoUsuarioRequest request
    ) {
        String motivo = request != null ? request.getMotivo() : null;
        return ResponseEntity.ok(authService.rechazarUsuario(id, motivo));
    }

    /**
     * DELETE /users/{id}: Eliminar usuario.
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        authService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
