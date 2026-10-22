package com.consego.solicitudes.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampoPersonalizado implements Serializable {

    private String id;              // Identificador de la propiedad (ej: "ip_host", "recurso_aws", "ambiente")
    private String etiqueta;        // Etiqueta visible en el formulario (ej: "IP de Host", "Recurso / Rol IAM")
    private String tipo;            // "text", "select", "number", "textarea"
    private String placeholder;     // Texto de ayuda (ej: "10.200.4.15", "arn:aws:iam::...")
    private boolean requerido;
    private List<String> opciones;  // Opciones predefinidas cuando tipo == "select"
}
