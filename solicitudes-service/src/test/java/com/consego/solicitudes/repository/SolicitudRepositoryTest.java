package com.consego.solicitudes.repository;

import com.consego.solicitudes.model.Solicitud;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class SolicitudRepositoryTest {

    @Autowired
    private SolicitudRepository solicitudRepository;

    @Test
    void testInsertarSolicitud() {
        Solicitud solicitud = Solicitud.builder()
                .plataforma("AWS Cloud Infrastructure")
                .motivo("Despliegue de clúster de microservicios")
                .usuarioSolicitanteId(101L)
                .estado("PENDIENTE")
                .fechaCreacion(LocalDateTime.now())
                .build();

        Solicitud guardada = solicitudRepository.save(solicitud);

        assertThat(guardada).isNotNull();
        assertThat(guardada.getId()).isNotNull().isPositive();
        assertThat(guardada.getPlataforma()).isEqualTo("AWS Cloud Infrastructure");
        assertThat(guardada.getEstado()).isEqualTo("PENDIENTE");
    }

    @Test
    void testActualizarSolicitud() {
        Solicitud inicial = Solicitud.builder()
                .plataforma("GitHub Organization")
                .motivo("Revisión de repositorios para auditoría")
                .usuarioSolicitanteId(102L)
                .estado("PENDIENTE")
                .build();
        Solicitud guardada = solicitudRepository.save(inicial);

        Solicitud recuperada = solicitudRepository.findById(guardada.getId()).orElseThrow();
        recuperada.setEstado("APROBADA");
        Solicitud actualizada = solicitudRepository.save(recuperada);

        assertThat(actualizada.getId()).isEqualTo(guardada.getId());
        assertThat(actualizada.getEstado()).isEqualTo("APROBADA");
    }

    @Test
    void testListarSolicitudes() {
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

        List<Solicitud> lista = solicitudRepository.findAll();

        assertThat(lista).isNotNull().hasSize(2);
        assertThat(lista).extracting(Solicitud::getPlataforma)
                .containsExactlyInAnyOrder("Azure Portal", "VMs On-Premise");
    }

    @Test
    void testEliminarSolicitud() {
        Solicitud solicitud = Solicitud.builder()
                .plataforma("Jira Software")
                .motivo("Seguimiento de incidencias de producción")
                .usuarioSolicitanteId(105L)
                .estado("PENDIENTE")
                .build();
        Solicitud guardada = solicitudRepository.save(solicitud);
        Long id = guardada.getId();

        solicitudRepository.deleteById(id);
        Optional<Solicitud> resultado = solicitudRepository.findById(id);

        assertThat(resultado).isEmpty();
        assertThat(solicitudRepository.existsById(id)).isFalse();
    }
}
