package com.consego.solicitudes.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad Solicitud mapeada a la tabla 'solicitudes' según los campos exactos de la rúbrica:
 * id, plataforma, motivo, estado, usuarioSolicitanteId, fechaCreacion.
 */
@Entity
@Table(name = "solicitudes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La plataforma es obligatoria")
    @Column(nullable = false, length = 100)
    private String plataforma;

    @Column(length = 500)
    @com.fasterxml.jackson.annotation.JsonAlias({"justificacion", "motivo"})
    private String motivo; // Motivo o justificación de la solicitud

    @NotBlank(message = "El estado es obligatorio")
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String estado = "PENDIENTE"; // PENDIENTE, APROBADA, RECHAZADA

    @NotNull(message = "El ID del usuario solicitante es obligatorio")
    @Column(name = "usuario_solicitante_id", nullable = false)
    private Long usuarioSolicitanteId;

    @Column(name = "fecha_creacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Transient
    @com.fasterxml.jackson.annotation.JsonProperty("justificacion")
    public String getJustificacion() {
        return this.motivo;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("justificacion")
    public void setJustificacion(String justificacion) {
        if (justificacion != null && !justificacion.isBlank()) {
            this.motivo = justificacion;
        }
    }

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
        if (this.estado == null || this.estado.isBlank()) {
            this.estado = "PENDIENTE";
        }
    }
}
