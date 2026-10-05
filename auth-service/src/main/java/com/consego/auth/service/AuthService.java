package com.consego.auth.service;

import com.consego.auth.dto.AuthRequest;
import com.consego.auth.dto.AuthResponse;
import com.consego.auth.dto.UserResponse;
import com.consego.auth.model.Usuario;
import com.consego.auth.repository.UsuarioRepository;
import com.consego.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de lógica de negocio para auth-service según rúbrica académica:
 * - Cifrado obligatorio con BCryptPasswordEncoder.
 * - Validación de contraseñas mediante passwordEncoder.matches().
 * - Emisión de JWT con datos de rol y usuario.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * POST /register: Recibe datos de usuario, encripta el password con BCryptPasswordEncoder
     * y persiste en base de datos.
     */
    @Transactional
    public AuthResponse register(AuthRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("El nombre de usuario '" + request.getUsername() + "' ya está registrado");
        }

        Usuario usuario = Usuario.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword())) // Cifrado con BCryptPasswordEncoder
                .rol(request.getRol() != null && !request.getRol().isBlank() ? request.getRol() : "Solicitante")
                .activo(true)
                .build();

        Usuario guardado = usuarioRepository.save(usuario);
        String token = jwtUtil.generateToken(guardado);

        return AuthResponse.builder()
                .token(token)
                .id(guardado.getId())
                .rol(guardado.getRol())
                .role(guardado.getRol())
                .username(guardado.getUsername())
                .type("Bearer")
                .build();
    }

    /**
     * POST /login: Valida credenciales contra la BD usando passwordEncoder.matches().
     * Si coincide, retorna JWT, rol y username; de lo contrario, lanza BadCredentialsException (HTTP 401).
     */
    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        // 1. Buscar usuario en base de datos
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas: usuario o contraseña incorrectos"));

        // 2. Verificar contraseña con matches() de BCrypt
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new BadCredentialsException("Credenciales inválidas: usuario o contraseña incorrectos");
        }

        // 3. Generar token JWT si la validación fue exitosa
        String token = jwtUtil.generateToken(usuario);

        return AuthResponse.builder()
                .token(token)
                .id(usuario.getId())
                .rol(usuario.getRol())
                .role(usuario.getRol())
                .username(usuario.getUsername())
                .type("Bearer")
                .build();
    }

    /**
     * GET /users/{id}: Retorna datos básicos del usuario para consumo interno de microservicios.
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return usuarioRepository.findById(id)
                .map(u -> UserResponse.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .rol(u.getRol())
                        .activo(u.isActivo())
                        .exists(true)
                        .build())
                .orElse(UserResponse.builder().id(id).exists(false).build());
    }
}
