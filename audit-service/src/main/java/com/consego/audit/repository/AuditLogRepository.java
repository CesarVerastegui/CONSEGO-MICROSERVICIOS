package com.consego.audit.repository;

import com.consego.audit.model.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    List<AuditLog> findByEntidadIdOrderByFechaEventoDesc(Long entidadId);

    List<AuditLog> findByUsuarioIdOrderByFechaEventoDesc(Long usuarioId);

    List<AuditLog> findAllByOrderByFechaEventoDesc();
}
