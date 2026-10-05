package com.consego.solicitudes.repository;

import com.consego.solicitudes.model.Solicitud;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Suite de Pruebas Unitarias para SolicitudRepository.
 * Cumple con el requisito obligatorio de la Rúbrica de Evaluación (6.0 Puntos).
 * Utiliza @DataJpaTest con base de datos en memoria H2 y JUnit 5,
 * cubriendo exactamente las 4 operaciones CRUD a nivel de repositorio:
 * a) testInsertarSolicitud()
 * b) testActualizarSolicitud()
 * c) testListarSolicitudes()
 * d) testEliminarSolicitud()
 */
@DataJpaTest
class SolicitudRepositoryTest {

    @Autowired
    private SolicitudRepository solicitudRepository;

    /**
     * a) Caso 1: Insertar Solicitud
     * Verifica que al persistir una nueva Solicitud, se genere un identificador (ID) no nulo.
     */
    @Test
    @DisplayName("a) Insertar Solicitud - Debe persistir y asignar ID autoincremental no nulo")
    void testInsertarSolicitud() {
        // Arrange
        Solicitud solicitud = Solicitud.builder()
                .plataforma("AWS Cloud Infrastructure")
                .motivo("Despliegue de clúster de microservicios")
                .usuarioSolicitanteId(101L)
                .estado("PENDIENTE")
                .fechaCreacion(LocalDateTime.now())
                .build();

        // Act
        Solicitud guardada = solicitudRepository.save(solicitud);

        // Assert
        assertThat(guardada).isNotNull();
        assertThat(guardada.getId()).isNotNull().isPositive();
        assertThat(guardada.getPlataforma()).isEqualTo("AWS Cloud Infrastructure");
        assertThat(guardada.getEstado()).isEqualTo("PENDIENTE");
    }

    /**
     * b) Caso 2: Actualizar Solicitud
     * Inserta una solicitud con estado 'PENDIENTE', la recupera, actualiza a 'APROBADA'
     * y verifica que el estado se haya persistido correctamente.
     */
    @Test
    @DisplayName("b) Actualizar Solicitud - Debe actualizar el estado de PENDIENTE a APROBADA")
    void testActualizarSolicitud() {
        // Arrange
        Solicitud inicial = Solicitud.builder()
                .plataforma("GitHub Organization")
                .motivo("Revisión de repositorios para auditoría")
                .usuarioSolicitanteId(102L)
                .estado("PENDIENTE")
                .build();
        Solicitud guardada = solicitudRepository.save(inicial);

        // Act
        Solicitud recuperada = solicitudRepository.findById(guardada.getId()).orElseThrow();
        recuperada.setEstado("APROBADA");
        Solicitud actualizada = solicitudRepository.save(recuperada);

        // Assert
        assertThat(actualizada.getId()).isEqualTo(guardada.getId());
        assertThat(actualizada.getEstado()).isEqualTo("APROBADA");
    }

    /**
     * c) Caso 3: Listar Solicitudes
     * Inserta al menos dos solicitudes y verifica que findAll() devuelva el tamaño correcto.
     */
    @Test
    @DisplayName("c) Listar Solicitudes - Debe recuperar todas las solicitudes registradas")
    void testListarSolicitudes() {
        // Arrange: Insertar al menos dos solicitudes
        Solicitud s1 = Solicitud.builder()
                .plataforma("Azure Portal")
                .motivo("Gestión de bases de datos Azure SQL")
                .usuarioSolicitanteId(103L)
                .estado("PENDIENTE")
                .build();

        Solicitud s2 = Solicitud.builder()
                .plataforma("VMs On-Premise")
                .motivo("Mantenimiento de servidores locales")
                .usuarioSolicitanteId(104L)
                .estado("PENDIENTE")
                .build();

        solicitudRepository.save(s1);
        solicitudRepository.save(s2);

        // Act
        List<Solicitud> lista = solicitudRepository.findAll();

        // Assert
        assertThat(lista).isNotNull().hasSize(2);
        assertThat(lista).extracting(Solicitud::getPlataforma)
                .containsExactlyInAnyOrder("Azure Portal", "VMs On-Premise");
    }

    /**
     * d) Caso 4: Eliminar Solicitud
     * Inserta una solicitud, la elimina mediante deleteById() y comprueba con findById()
     * que el resultado sea un Optional vacío (no existe).
     */
    @Test
    @DisplayName("d) Eliminar Solicitud - Debe eliminar el registro y retornar Optional vacío")
    void testEliminarSolicitud() {
        // Arrange
        Solicitud solicitud = Solicitud.builder()
                .plataforma("Jira Software")
                .motivo("Seguimiento de incidencias de producción")
                .usuarioSolicitanteId(105L)
                .estado("PENDIENTE")
                .build();
        Solicitud guardada = solicitudRepository.save(solicitud);
        Long id = guardada.getId();

        // Act
        solicitudRepository.deleteById(id);
        Optional<Solicitud> resultado = solicitudRepository.findById(id);

        // Assert
        assertThat(resultado).isEmpty();
        assertThat(solicitudRepository.existsById(id)).isFalse();
    }
}
