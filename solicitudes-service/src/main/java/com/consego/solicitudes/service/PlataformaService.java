package com.consego.solicitudes.service;

import com.consego.solicitudes.model.CampoPersonalizado;
import com.consego.solicitudes.model.Plataforma;
import com.consego.solicitudes.repository.PlataformaRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlataformaService {

    private final PlataformaRepository plataformaRepository;

    @PostConstruct
    public void seedPlataformas() {
        if (plataformaRepository.count() == 0) {
            log.info("Inicializando catálogo semilla de plataformas tecnológicas con campos dinámicos...");
            List<Plataforma> seed = crearListaSemilla();
            plataformaRepository.saveAll(seed);
            log.info("Catálogo de plataformas inicializado con {} registros.", seed.size());
        } else {
            actualizarCatalogoSemillaSiEsNecesario();
        }
    }

    private List<Plataforma> crearListaSemilla() {
        return List.of(
                Plataforma.builder()
                        .nombre("Amazon Web Services (AWS)")
                        .categoria("Cloud & Infraestructura")
                        .criticidad("CRITICA")
                        .descripcion("Acceso a consolas de cómputo EC2, S3, IAM Roles y VPCs productivas.")
                        .icono("cloud")
                        .activa(true)
                        .camposPersonalizados(List.of(
                                CampoPersonalizado.builder()
                                        .id("recurso_rol")
                                        .etiqueta("Recurso / Rol IAM")
                                        .tipo("text")
                                        .placeholder("ej. arn:aws:iam::123456789012:role/DevRole o S3-Bucket-Data")
                                        .requerido(true)
                                        .build(),
                                CampoPersonalizado.builder()
                                        .id("region_aws")
                                        .etiqueta("Región AWS")
                                        .tipo("select")
                                        .opciones(List.of("us-east-1 (N. Virginia)", "us-west-2 (Oregon)", "sa-east-1 (São Paulo)", "eu-west-1 (Ireland)"))
                                        .requerido(true)
                                        .build(),
                                CampoPersonalizado.builder()
                                        .id("ambiente")
                                        .etiqueta("Ambiente Destino")
                                        .tipo("select")
                                        .opciones(List.of("Desarrollo", "Staging", "Producción"))
                                        .requerido(true)
                                        .build()
                        ))
                        .build(),

                Plataforma.builder()
                        .nombre("VPN Corporativa & Red Segura")
                        .categoria("Seguridad & Redes")
                        .criticidad("ALTA")
                        .descripcion("Túnel seguro VPN IPsec/OpenVPN para acceso a redes internas corporativas y DMZ.")
                        .icono("vpn_key")
                        .activa(true)
                        .camposPersonalizados(List.of(
                                CampoPersonalizado.builder()
                                        .id("ip_host")
                                        .etiqueta("Dirección IP / Host")
                                        .tipo("text")
                                        .placeholder("ej. 10.200.4.15 o subred 10.200.0.0/24")
                                        .requerido(true)
                                        .build(),
                                CampoPersonalizado.builder()
                                        .id("puerto_servicio")
                                        .etiqueta("Puerto / Protocolo")
                                        .tipo("text")
                                        .placeholder("ej. SSH 22, RDP 3389, HTTPS 443")
                                        .requerido(true)
                                        .build(),
                                CampoPersonalizado.builder()
                                        .id("segmento_red")
                                        .etiqueta("Segmento de Red")
                                        .tipo("select")
                                        .opciones(List.of("Red Interna Corporativa", "Zona DMZ Servidores", "VPC Cloud Peering"))
                                        .requerido(true)
                                        .build()
                        ))
                        .build(),

                Plataforma.builder()
                        .nombre("Google Cloud Platform (GCP)")
                        .categoria("Cloud & Infraestructura")
                        .criticidad("CRITICA")
                        .descripcion("Consola BigQuery, Google Kubernetes Engine (GKE) y Cloud Functions.")
                        .icono("cloud_queue")
                        .activa(true)
                        .camposPersonalizados(List.of(
                                CampoPersonalizado.builder()
                                        .id("project_id")
                                        .etiqueta("Project ID GCP")
                                        .tipo("text")
                                        .placeholder("ej. consego-prod-analytics")
                                        .requerido(true)
                                        .build(),
                                CampoPersonalizado.builder()
                                        .id("servicio_gcp")
                                        .etiqueta("Servicio Solicitado")
                                        .tipo("select")
                                        .opciones(List.of("BigQuery Analytics", "Google Kubernetes Engine (GKE)", "Cloud Storage (GCS)", "Cloud Run Services"))
                                        .requerido(true)
                                        .build()
                        ))
                        .build(),

                Plataforma.builder()
                        .nombre("Microsoft Azure")
                        .categoria("Cloud & Infraestructura")
                        .criticidad("ALTA")
                        .descripcion("Acceso a Azure Portal, Entra ID, App Services y Azure SQL Database.")
                        .icono("dns")
                        .activa(true)
                        .camposPersonalizados(List.of(
                                CampoPersonalizado.builder()
                                        .id("suscripcion_id")
                                        .etiqueta("Subscription ID / Resource Group")
                                        .tipo("text")
                                        .placeholder("ej. sub-consego-core / rg-banking")
                                        .requerido(true)
                                        .build(),
                                CampoPersonalizado.builder()
                                        .id("rol_rbac")
                                        .etiqueta("Rol RBAC Asignable")
                                        .tipo("select")
                                        .opciones(List.of("Reader (Solo Lectura)", "Contributor (Colaborador)", "User Access Administrator"))
                                        .requerido(true)
                                        .build()
                        ))
                        .build(),

                Plataforma.builder()
                        .nombre("GitHub Enterprise")
                        .categoria("DevOps & CI/CD")
                        .criticidad("ALTA")
                        .descripcion("Permisos de escritura, administración de repositorios y Secrets de Actions.")
                        .icono("terminal")
                        .activa(true)
                        .camposPersonalizados(List.of(
                                CampoPersonalizado.builder()
                                        .id("repositorio")
                                        .etiqueta("Nombre del Repositorio")
                                        .tipo("text")
                                        .placeholder("ej. consego/solicitudes-service")
                                        .requerido(true)
                                        .build(),
                                CampoPersonalizado.builder()
                                        .id("nivel_permiso")
                                        .etiqueta("Nivel de Permisos")
                                        .tipo("select")
                                        .opciones(List.of("Lectura (Read)", "Escritura (Write / Pull Requests)", "Mantenimiento (Maintain)"))
                                        .requerido(true)
                                        .build()
                        ))
                        .build(),

                Plataforma.builder()
                        .nombre("Salesforce CRM")
                        .categoria("SaaS Empresarial")
                        .criticidad("MEDIA")
                        .descripcion("Módulos de ventas, soporte al cliente y reportería ejecutiva de clientes.")
                        .icono("hub")
                        .activa(true)
                        .camposPersonalizados(List.of(
                                CampoPersonalizado.builder()
                                        .id("perfil_salesforce")
                                        .etiqueta("Perfil Solicitado")
                                        .tipo("select")
                                        .opciones(List.of("Standard User", "Sales Operations", "Marketing User", "System Administrator"))
                                        .requerido(true)
                                        .build()
                        ))
                        .build(),

                Plataforma.builder()
                        .nombre("Oracle Autonomous DB")
                        .categoria("Base de Datos")
                        .criticidad("CRITICA")
                        .descripcion("Esquemas transaccionales core bancarios y almacenamiento relacional de misión crítica.")
                        .icono("database")
                        .activa(true)
                        .camposPersonalizados(List.of(
                                CampoPersonalizado.builder()
                                        .id("esquema_bd")
                                        .etiqueta("Esquema / Base de Datos")
                                        .tipo("text")
                                        .placeholder("ej. FIN_TRANS_PROD")
                                        .requerido(true)
                                        .build(),
                                CampoPersonalizado.builder()
                                        .id("tipo_privilegio")
                                        .etiqueta("Privilegios SQL")
                                        .tipo("select")
                                        .opciones(List.of("Solo Lectura (SELECT)", "Operaciones DML (INSERT/UPDATE)", "DBA / DDL Completo"))
                                        .requerido(true)
                                        .build()
                        ))
                        .build()
        );
    }

    private void actualizarCatalogoSemillaSiEsNecesario() {
        if (!plataformaRepository.existsByNombre("VPN Corporativa & Red Segura")) {
            plataformaRepository.save(
                    Plataforma.builder()
                            .nombre("VPN Corporativa & Red Segura")
                            .categoria("Seguridad & Redes")
                            .criticidad("ALTA")
                            .descripcion("Túnel seguro VPN IPsec/OpenVPN para acceso a redes internas corporativas y DMZ.")
                            .icono("vpn_key")
                            .activa(true)
                            .camposPersonalizados(List.of(
                                    CampoPersonalizado.builder()
                                            .id("ip_host")
                                            .etiqueta("Dirección IP / Host")
                                            .tipo("text")
                                            .placeholder("ej. 10.200.4.15 o subred 10.200.0.0/24")
                                            .requerido(true)
                                            .build(),
                                    CampoPersonalizado.builder()
                                            .id("puerto_servicio")
                                            .etiqueta("Puerto / Protocolo")
                                            .tipo("text")
                                            .placeholder("ej. SSH 22, RDP 3389, HTTPS 443")
                                            .requerido(true)
                                            .build(),
                                    CampoPersonalizado.builder()
                                            .id("segmento_red")
                                            .etiqueta("Segmento de Red")
                                            .tipo("select")
                                            .opciones(List.of("Red Interna Corporativa", "Zona DMZ Servidores", "VPC Cloud Peering"))
                                            .requerido(true)
                                            .build()
                            ))
                            .build()
            );
            log.info("Plataforma semilla 'VPN Corporativa & Red Segura' agregada.");
        }

        List<Plataforma> todas = plataformaRepository.findAll();
        boolean modificado = false;
        for (Plataforma p : todas) {
            if (p.getCamposPersonalizados() == null || p.getCamposPersonalizados().isEmpty()) {
                asignarCamposPorDefectoSegunNombre(p);
                modificado = true;
            }
        }
        if (modificado) {
            plataformaRepository.saveAll(todas);
            log.info("Plataformas existentes actualizadas con campos dinámicos predeterminados.");
        }
    }

    private void asignarCamposPorDefectoSegunNombre(Plataforma p) {
        String n = p.getNombre().toLowerCase();
        if (n.contains("aws")) {
            p.setCamposPersonalizados(List.of(
                    CampoPersonalizado.builder().id("recurso_rol").etiqueta("Recurso / Rol IAM").tipo("text").placeholder("ej. arn:aws:iam::... o S3-Bucket").requerido(true).build(),
                    CampoPersonalizado.builder().id("region_aws").etiqueta("Región AWS").tipo("select").opciones(List.of("us-east-1 (N. Virginia)", "us-west-2 (Oregon)", "sa-east-1 (São Paulo)")).requerido(true).build(),
                    CampoPersonalizado.builder().id("ambiente").etiqueta("Ambiente").tipo("select").opciones(List.of("Desarrollo", "Staging", "Producción")).requerido(true).build()
            ));
        } else if (n.contains("vpn")) {
            p.setCamposPersonalizados(List.of(
                    CampoPersonalizado.builder().id("ip_host").etiqueta("Dirección IP / Host").tipo("text").placeholder("ej. 10.200.4.15").requerido(true).build(),
                    CampoPersonalizado.builder().id("puerto_servicio").etiqueta("Puerto / Protocolo").tipo("text").placeholder("ej. SSH 22, HTTPS 443").requerido(true).build(),
                    CampoPersonalizado.builder().id("segmento_red").etiqueta("Segmento de Red").tipo("select").opciones(List.of("Red Interna Corporativa", "Zona DMZ")).requerido(true).build()
            ));
        } else if (n.contains("github")) {
            p.setCamposPersonalizados(List.of(
                    CampoPersonalizado.builder().id("repositorio").etiqueta("Nombre del Repositorio").tipo("text").placeholder("ej. consego/auth-service").requerido(true).build(),
                    CampoPersonalizado.builder().id("nivel_permiso").etiqueta("Nivel de Permisos").tipo("select").opciones(List.of("Lectura (Read)", "Escritura (Write)", "Mantenimiento (Maintain)")).requerido(true).build()
            ));
        } else if (n.contains("oracle") || n.contains("database") || n.contains("sql")) {
            p.setCamposPersonalizados(List.of(
                    CampoPersonalizado.builder().id("esquema_bd").etiqueta("Esquema / Base de Datos").tipo("text").placeholder("ej. FIN_TRANS_PROD").requerido(true).build(),
                    CampoPersonalizado.builder().id("tipo_privilegio").etiqueta("Privilegios SQL").tipo("select").opciones(List.of("Solo Lectura (SELECT)", "Escritura (DML)", "DBA (DDL)")).requerido(true).build()
            ));
        } else {
            p.setCamposPersonalizados(List.of(
                    CampoPersonalizado.builder().id("detalle_recurso").etiqueta("Recurso o Módulo Específico").tipo("text").placeholder("Indica el recurso al que requieres acceso").requerido(true).build()
            ));
        }
    }

    @Transactional(readOnly = true)
    public List<Plataforma> listarTodas() {
        return plataformaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Plataforma> listarActivas() {
        return plataformaRepository.findByActivaTrue();
    }

    @Transactional(readOnly = true)
    public Plataforma obtenerPorId(Long id) {
        return plataformaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Plataforma no encontrada con ID: " + id));
    }

    @Transactional
    public Plataforma crearPlataforma(Plataforma plataforma) {
        if (plataformaRepository.existsByNombre(plataforma.getNombre())) {
            throw new IllegalArgumentException("Ya existe una plataforma con el nombre: " + plataforma.getNombre());
        }
        if (plataforma.getCamposPersonalizados() == null) {
            plataforma.setCamposPersonalizados(new ArrayList<>());
        }
        return plataformaRepository.save(plataforma);
    }

    @Transactional
    public Plataforma actualizarPlataforma(Long id, Plataforma datos) {
        Plataforma existente = obtenerPorId(id);
        existente.setNombre(datos.getNombre());
        existente.setCategoria(datos.getCategoria());
        existente.setCriticidad(datos.getCriticidad());
        existente.setDescripcion(datos.getDescripcion());
        if (datos.getIcono() != null && !datos.getIcono().isBlank()) {
            existente.setIcono(datos.getIcono());
        }
        existente.setActiva(datos.isActiva());
        if (datos.getCamposPersonalizados() != null) {
            existente.setCamposPersonalizados(datos.getCamposPersonalizados());
        }
        return plataformaRepository.save(existente);
    }

    @Transactional
    public Plataforma toggleEstado(Long id, boolean activa) {
        Plataforma existente = obtenerPorId(id);
        existente.setActiva(activa);
        return plataformaRepository.save(existente);
    }

    @Transactional
    public void eliminarPlataforma(Long id) {
        if (!plataformaRepository.existsById(id)) {
            throw new IllegalArgumentException("Plataforma no encontrada con ID: " + id);
        }
        plataformaRepository.deleteById(id);
    }
}
