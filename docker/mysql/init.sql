-- Script de Inicialización de Bases de Datos para Microservicios CONSEGO
CREATE DATABASE IF NOT EXISTS authdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS appdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Asignación de permisos al usuario de la aplicación
GRANT ALL PRIVILEGES ON authdb.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON appdb.* TO 'root'@'%';
FLUSH PRIVILEGES;

-- 1. Tabla y Usuarios Iniciales en authdb (BCrypt hash de 'password123')
USE authdb;

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    activo BIT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

INSERT IGNORE INTO usuarios (id, username, password, rol, activo) VALUES
(1, 'admin', '$2a$10$n5p4b1aahTrResbe55Zxce9UR/H98zKWGaEKzGasrjNkXncisECHm', 'Admin', 1),
(2, 'operador', '$2a$10$n5p4b1aahTrResbe55Zxce9UR/H98zKWGaEKzGasrjNkXncisECHm', 'Solicitante', 1),
(3, 'auditor', '$2a$10$n5p4b1aahTrResbe55Zxce9UR/H98zKWGaEKzGasrjNkXncisECHm', 'Auditor', 1);

-- 2. Tabla y Solicitudes Iniciales en appdb
USE appdb;

CREATE TABLE IF NOT EXISTS solicitudes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plataforma VARCHAR(100) NOT NULL,
    motivo VARCHAR(500),
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    usuario_solicitante_id BIGINT NOT NULL,
    fecha_creacion DATETIME(6) NOT NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO solicitudes (id, plataforma, motivo, estado, usuario_solicitante_id, fecha_creacion) VALUES
(1, 'AWS Cloud', 'Acceso a servidores para auditoria de seguridad', 'APROBADA', 1, NOW()),
(2, 'Azure Portal', 'Gestión de clústeres y balanceadores de carga', 'PENDIENTE', 1, NOW()),
(3, 'GitHub Organization', 'Acceso para despliegue de pipelines CI/CD de microservicios', 'PENDIENTE', 2, NOW());
