package com.consego.solicitudes.repository;

import com.consego.solicitudes.model.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    List<Solicitud> findByUsuarioSolicitanteId(Long usuarioSolicitanteId);

    List<Solicitud> findByUsuarioSolicitanteIdOrderByFechaCreacionDesc(Long usuarioSolicitanteId);

    List<Solicitud> findAllByOrderByFechaCreacionDesc();

    List<Solicitud> findByEstado(String estado);
}
