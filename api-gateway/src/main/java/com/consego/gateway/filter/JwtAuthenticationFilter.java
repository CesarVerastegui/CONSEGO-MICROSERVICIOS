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

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        if (request.getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        if (isPublicEndpoint(path)) {
            return chain.filter(exchange);
        }

        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            return onError(exchange, "Falta la cabecera Authorization requerida");
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "La cabecera Authorization debe comenzar con 'Bearer '");
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.validateToken(token)) {
            return onError(exchange, "Token JWT invalido o expirado");
        }

        try {
            Claims claims = jwtUtil.extractAllClaims(token);
            Object rolClaim = claims.get("rol") != null ? claims.get("rol") : claims.get("role");
            ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                    .header("X-Auth-Username", claims.getSubject())
                    .header("X-Auth-Role", String.valueOf(rolClaim))
                    .header("X-Auth-User-Id", String.valueOf(claims.get("id")))
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        } catch (Exception ex) {
            return onError(exchange, "Error al procesar credenciales JWT");
        }
    }

    private boolean isPublicEndpoint(String path) {
        return path != null && (path.startsWith("/api/auth/") || path.equals("/api/auth"));
    }

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
        return -1;
    }
}
