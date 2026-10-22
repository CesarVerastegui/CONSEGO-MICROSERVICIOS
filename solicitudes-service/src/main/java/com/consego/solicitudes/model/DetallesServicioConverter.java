package com.consego.solicitudes.model;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@Converter
@Slf4j
public class DetallesServicioConverter implements AttributeConverter<Map<String, Object>, String> {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Map<String, Object> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        try {
            return mapper.writeValueAsString(attribute);
        } catch (Exception e) {
            log.error("Error serializando detalles de servicio a JSON: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public Map<String, Object> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new HashMap<>();
        }
        try {
            return mapper.readValue(dbData, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Error deserializando detalles de servicio desde JSON: {}", e.getMessage());
            return new HashMap<>();
        }
    }
}
