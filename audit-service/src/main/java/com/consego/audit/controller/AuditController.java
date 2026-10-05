package com.consego.audit.controller;

import com.consego.audit.model.AuditLog;
import com.consego.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para consultar los logs de auditoría generados por el sistema.
 */
@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<List<AuditLog>> listarTodos() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByFechaEventoDesc());
    }

    @GetMapping("/solicitud/{id}")
    public ResponseEntity<List<AuditLog>> listarPorSolicitud(@PathVariable Long id) {
        return ResponseEntity.ok(auditLogRepository.findByEntidadIdOrderByFechaEventoDesc(id));
    }

    @GetMapping("/usuario/{id}")
    public ResponseEntity<List<AuditLog>> listarPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(auditLogRepository.findByUsuarioIdOrderByFechaEventoDesc(id));
    }
}
