package com.consego.solicitudes.controller;

import com.consego.solicitudes.model.Solicitud;
import com.consego.solicitudes.service.SolicitudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
public class SolicitudController {

    private final SolicitudService solicitudService;

    @GetMapping
    public ResponseEntity<List<Solicitud>> listarTodas(@RequestParam(name = "usuarioId", required = false) Long usuarioId) {
        return ResponseEntity.ok(solicitudService.listarTodas(usuarioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Solicitud> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<Solicitud> crearSolicitud(@Valid @RequestBody Solicitud solicitud) {
        Solicitud nueva = solicitudService.crearSolicitud(solicitud);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSolicitud(@PathVariable Long id) {
        solicitudService.eliminarSolicitud(id);
        return ResponseEntity.noContent().build();
    }
}
