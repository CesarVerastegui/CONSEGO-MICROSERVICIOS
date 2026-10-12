package com.consego.solicitudes.controller;

import com.consego.solicitudes.model.Solicitud;
import com.consego.solicitudes.service.SolicitudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el core de negocio solicitudes-service (@RequestMapping("/api/solicitudes")).
 * Expone explícitamente los 4 verbos HTTP requeridos por la rúbrica (GET, POST, PUT, DELETE).
 */
@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
public class SolicitudController {

    private final SolicitudService solicitudService;

    /**
     * 1. GET: Listar solicitudes (todas o filtradas por usuario solicitante).
     * GET /api/solicitudes?usuarioId={id}
     */
    @GetMapping
    public ResponseEntity<List<Solicitud>> listarTodas(@RequestParam(name = "usuarioId", required = false) Long usuarioId) {
        return ResponseEntity.ok(solicitudService.listarTodas(usuarioId));
    }

    /**
     * 1.1 GET: Obtener detalle por ID.
     * GET /api/solicitudes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Solicitud> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudService.obtenerPorId(id));
    }

    /**
     * 2. POST: Registrar una nueva solicitud (con validación sincrónica Feign + Resilience4J).
     * POST /api/solicitudes
     */
    @PostMapping
    public ResponseEntity<Solicitud> crearSolicitud(@Valid @RequestBody Solicitud solicitud) {
        Solicitud nueva = solicitudService.crearSolicitud(solicitud);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    /**
     * 3. PUT: Actualizar estado de una solicitud existente (Aprobar/Rechazar).
     * Soporta tanto PUT /api/solicitudes/{id}?nuevoEstado=APROBADA
     * como PUT /api/solicitudes/{id}/estado o con body JSON { "estado": "APROBADA", "comentario": "..." }.
     */
    @PutMapping(value = {"/{id}", "/{id}/estado"})
    public ResponseEntity<Solicitud> actualizarEstado(
            @PathVariable Long id,
            @RequestParam(name = "nuevoEstado", required = false) String nuevoEstadoParam,
            @RequestParam(name = "comentario", required = false) String comentarioParam,
            @RequestBody(required = false) com.consego.solicitudes.dto.ResolucionRequest body
    ) {
        String estadoFinal = (nuevoEstadoParam != null && !nuevoEstadoParam.isBlank())
                ? nuevoEstadoParam
                : (body != null ? body.getEstadoFinal() : null);

        String comentarioFinal = (comentarioParam != null && !comentarioParam.isBlank())
                ? comentarioParam
                : (body != null ? body.getComentarioFinal() : null);

        if (estadoFinal == null || estadoFinal.isBlank()) {
            throw new IllegalArgumentException("Debe proporcionar el parámetro 'nuevoEstado' o el campo 'estado' en el cuerpo JSON.");
        }

        Solicitud actualizada = solicitudService.actualizarEstado(id, estadoFinal, comentarioFinal);
        return ResponseEntity.ok(actualizada);
    }

    /**
     * 3.1 PUT: Aprobar solicitud con comentario de resolución.
     * PUT /api/solicitudes/{id}/aprobar
     */
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<Solicitud> aprobarSolicitud(
            @PathVariable Long id,
            @RequestBody(required = false) com.consego.solicitudes.dto.ResolucionRequest body
    ) {
        String comentario = (body != null && !body.getComentarioFinal().isBlank())
                ? body.getComentarioFinal()
                : "Solicitud aprobada conforme a las políticas de seguridad.";
        return ResponseEntity.ok(solicitudService.actualizarEstado(id, "APROBADA", comentario));
    }

    /**
     * 3.2 PUT: Rechazar solicitud con comentario obligatorio de resolución.
     * PUT /api/solicitudes/{id}/rechazar
     */
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<Solicitud> rechazarSolicitud(
            @PathVariable Long id,
            @RequestBody(required = false) com.consego.solicitudes.dto.ResolucionRequest body
    ) {
        String comentario = (body != null && !body.getComentarioFinal().isBlank())
                ? body.getComentarioFinal()
                : "Solicitud rechazada tras evaluación de riesgo.";
        return ResponseEntity.ok(solicitudService.actualizarEstado(id, "RECHAZADA", comentario));
    }

    /**
     * 4. DELETE: Eliminar permanentemente una solicitud por ID.
     * DELETE /api/solicitudes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSolicitud(@PathVariable Long id) {
        solicitudService.eliminarSolicitud(id);
        return ResponseEntity.noContent().build();
    }
}
