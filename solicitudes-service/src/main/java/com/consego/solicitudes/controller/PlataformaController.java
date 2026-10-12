package com.consego.solicitudes.controller;

import com.consego.solicitudes.model.Plataforma;
import com.consego.solicitudes.service.PlataformaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/plataformas")
@RequiredArgsConstructor
public class PlataformaController {

    private final PlataformaService plataformaService;

    @GetMapping
    public ResponseEntity<List<Plataforma>> listarTodas(@RequestParam(required = false, defaultValue = "false") boolean soloActivas) {
        if (soloActivas) {
            return ResponseEntity.ok(plataformaService.listarActivas());
        }
        return ResponseEntity.ok(plataformaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Plataforma> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(plataformaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<Plataforma> crearPlataforma(@Valid @RequestBody Plataforma plataforma) {
        Plataforma nueva = plataformaService.crearPlataforma(plataforma);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Plataforma> actualizarPlataforma(@PathVariable Long id, @Valid @RequestBody Plataforma plataforma) {
        return ResponseEntity.ok(plataformaService.actualizarPlataforma(id, plataforma));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Plataforma> toggleEstado(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean activa = body != null && Boolean.TRUE.equals(body.get("activa"));
        return ResponseEntity.ok(plataformaService.toggleEstado(id, activa));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPlataforma(@PathVariable Long id) {
        plataformaService.eliminarPlataforma(id);
        return ResponseEntity.noContent().build();
    }
}
