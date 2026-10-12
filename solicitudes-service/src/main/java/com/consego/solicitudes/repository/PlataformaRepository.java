package com.consego.solicitudes.repository;

import com.consego.solicitudes.model.Plataforma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlataformaRepository extends JpaRepository<Plataforma, Long> {

    Optional<Plataforma> findByNombre(String nombre);

    List<Plataforma> findByActivaTrue();

    boolean existsByNombre(String nombre);
}
