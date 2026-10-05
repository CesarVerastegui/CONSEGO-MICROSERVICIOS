package com.consego.solicitudes.repository;

import com.consego.solicitudes.model.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio Spring Data JPA para la entidad Solicitud.
 */
@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    List<Solicitud> findByUsuarioSolicitanteId(Long usuarioSolicitanteId);

    List<Solicitud> findByEstado(String estado);
}
