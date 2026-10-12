package com.consego.solicitudes.model;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

/**
 * Convertidor JPA para serializar y deserializar la lista de campos personalizados de una plataforma a formato JSON (TEXT).
 * Proporciona flexibilidad no relacional (schemaless) sobre bases de datos SQL (H2, MySQL, PostgreSQL).
 */
@Converter
@Slf4j
public class CamposPersonalizadosConverter implements AttributeConverter<List<CampoPersonalizado>, String> {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<CampoPersonalizado> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        try {
            return mapper.writeValueAsString(attribute);
        } catch (Exception e) {
            log.error("Error serializando campos personalizados a JSON: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public List<CampoPersonalizado> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return mapper.readValue(dbData, new TypeReference<List<CampoPersonalizado>>() {});
        } catch (Exception e) {
            log.error("Error deserializando campos personalizados desde JSON: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
}
