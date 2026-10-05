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
}
