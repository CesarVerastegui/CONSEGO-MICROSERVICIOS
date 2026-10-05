package com.consego.gateway.filter;

import com.consego.gateway.security.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

/**
 * Filtro de Seguridad Global Reactivo para Spring Cloud Gateway.
 * Intercepta todas las peticiones hacia los microservicios:
 * - Omite validación si la ruta coincide con /api/auth/**.
 * - Para cualquier otra ruta, extrae 'Authorization: Bearer <token>', valida la firma y claims con JwtUtil.
 * - Si es inválido o no existe el token, responde de inmediato con HTTP 401 Unauthorized sin reenviar la petición.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 1. Permitir peticiones preflight CORS (OPTIONS)
        if (request.getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        // 2. Si la ruta coincide con /api/auth/**, dejar pasar la petición sin validar
        if (isPublicEndpoint(path)) {
            log.debug("Ruta pública de autenticación detectada: {}. Omitiendo filtro JWT.", path);
            return chain.filter(exchange);
        }

        // 3. Para cualquier otra ruta, extraer cabecera Authorization
        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            log.warn("Acceso no autorizado en Gateway: Falta cabecera Authorization en ruta {}", path);
            return onError(exchange, "Falta la cabecera Authorization requerida");
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        // 4. Validar formato Bearer
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Acceso no autorizado en Gateway: Formato Bearer inválido en ruta {}", path);
            return onError(exchange, "La cabecera Authorization debe comenzar con 'Bearer '");
        }

        String token = authHeader.substring(7);

        // 5. Validar firma y vigencia del token JWT con JwtUtil
        if (!jwtUtil.validateToken(token)) {
            log.warn("Acceso no autorizado en Gateway: Token inválido o expirado en ruta {}", path);
            return onError(exchange, "Token JWT inválido, adulterado o expirado");
        }

        try {
            Claims claims = jwtUtil.extractAllClaims(token);

            // Propagar información del usuario en headers HTTP hacia los microservicios internos
            Object rolClaim = claims.get("rol") != null ? claims.get("rol") : claims.get("role");
            ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                    .header("X-Auth-Username", claims.getSubject())
                    .header("X-Auth-Role", String.valueOf(rolClaim))
                    .header("X-Auth-User-Id", String.valueOf(claims.get("id")))
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        } catch (Exception ex) {
            log.error("Error al procesar claims de token en ruta {}: {}", path, ex.getMessage());
            return onError(exchange, "Error al procesar credenciales JWT");
        }
    }

    /**
     * Comprueba si la ruta solicitada coincide con /api/auth/**.
     */
    private boolean isPublicEndpoint(String path) {
        return path != null && (path.startsWith("/api/auth/") || path.equals("/api/auth"));
    }

    /**
     * Interrumpe la cadena de filtros de forma reactiva y responde con HTTP 401 Unauthorized sin reenviar la petición.
     */
    private Mono<Void> onError(ServerWebExchange exchange, String mensaje) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String jsonError = String.format("{\"error\": \"Unauthorized\", \"mensaje\": \"%s\", \"status\": 401}", mensaje);
        DataBuffer buffer = response.bufferFactory().wrap(jsonError.getBytes(StandardCharsets.UTF_8));

        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -1; // Alta precedencia en la cadena de filtros
    }
}
