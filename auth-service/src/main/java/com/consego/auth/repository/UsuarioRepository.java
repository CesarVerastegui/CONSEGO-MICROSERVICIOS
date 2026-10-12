package com.consego.auth.repository;

import com.consego.auth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio Spring Data JPA para la entidad Usuario.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByCorreo(String correo);

    Optional<Usuario> findByUsernameOrCorreo(String username, String correo);

    boolean existsByUsername(String username);

    boolean existsByCorreo(String correo);
}
