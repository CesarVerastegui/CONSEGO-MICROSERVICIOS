package com.consego.solicitudes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResolucionRequest {

    private String estado;
    private String nuevoEstado;
    private String comentario;
    private String comentarioResolucion;

    public String getEstadoFinal() {
        if (nuevoEstado != null && !nuevoEstado.isBlank()) {
            return nuevoEstado;
        }
        if (estado != null && !estado.isBlank()) {
            return estado;
        }
        return null;
    }

    public String getComentarioFinal() {
        if (comentario != null && !comentario.isBlank()) {
            return comentario;
        }
        if (comentarioResolucion != null && !comentarioResolucion.isBlank()) {
            return comentarioResolucion;
        }
        return "";
    }
}
