package com.consego.audit.repository;

import com.consego.audit.model.AuditLog;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para el repositorio NoSQL AuditLogRepository (MongoDB).
 * Valida la correcta persistencia y consulta de documentos de auditoría.
 */
@ExtendWith(MockitoExtension.class)
class AuditLogRepositoryTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Test
    @DisplayName("Debe persistir un documento de auditoría NoSQL en MongoDB con ID alfanumérico")
    void testGuardarDocumentoAuditoria() {
        AuditLog log = AuditLog.builder()
                .tipoEvento("SOLICITUD_CREADA")
                .entidadId(10L)
                .usuarioId(5L)
                .fechaEvento(LocalDateTime.now())
                .detalle("Creación de solicitud para acceso AWS")
                .build();

        AuditLog guardadoMock = AuditLog.builder()
                .id("65f1a2b3c4d5e6f7a8b9c0d1")
                .tipoEvento(log.getTipoEvento())
                .entidadId(log.getEntidadId())
                .usuarioId(log.getUsuarioId())
                .fechaEvento(log.getFechaEvento())
                .detalle(log.getDetalle())
                .build();

        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(guardadoMock);

        AuditLog resultado = auditLogRepository.save(log);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo("65f1a2b3c4d5e6f7a8b9c0d1");
        assertThat(resultado.getTipoEvento()).isEqualTo("SOLICITUD_CREADA");
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Debe consultar logs de auditoría ordenados por fecha descendente")
    void testListarPorEntidadOrdenado() {
        AuditLog log1 = AuditLog.builder()
                .id("doc1")
                .entidadId(10L)
                .tipoEvento("SOLICITUD_ACTUALIZADA")
                .fechaEvento(LocalDateTime.now())
                .build();

        when(auditLogRepository.findByEntidadIdOrderByFechaEventoDesc(10L))
                .thenReturn(List.of(log1));

        List<AuditLog> resultados = auditLogRepository.findByEntidadIdOrderByFechaEventoDesc(10L);

        assertThat(resultados).hasSize(1);
        assertThat(resultados.get(0).getTipoEvento()).isEqualTo("SOLICITUD_ACTUALIZADA");
        verify(auditLogRepository, times(1)).findByEntidadIdOrderByFechaEventoDesc(10L);
    }
}
