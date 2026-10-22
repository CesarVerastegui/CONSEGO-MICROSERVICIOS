package com.consego.solicitudes.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "plataformas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plataforma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de la plataforma es obligatorio")
    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @NotBlank(message = "La categoría es obligatoria")
    @Column(nullable = false, length = 100)
    private String categoria;

    @NotBlank(message = "La criticidad es obligatoria")
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String criticidad = "ALTA"; // CRITICA, ALTA, MEDIA, BAJA

    @Column(length = 500)
    private String descripcion;

    @Column(length = 50)
    @Builder.Default
    private String icono = "cloud"; // Material symbol icon name

    @Column(nullable = false)
    @Builder.Default
    private boolean activa = true;

    @Column(name = "fecha_creacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "campos_personalizados", columnDefinition = "TEXT")
    @Convert(converter = CamposPersonalizadosConverter.class)
    @Builder.Default
    private java.util.List<CampoPersonalizado> camposPersonalizados = new java.util.ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
        if (this.criticidad == null || this.criticidad.isBlank()) {
            this.criticidad = "ALTA";
        }
        if (this.icono == null || this.icono.isBlank()) {
            this.icono = "cloud";
        }
    }
}
