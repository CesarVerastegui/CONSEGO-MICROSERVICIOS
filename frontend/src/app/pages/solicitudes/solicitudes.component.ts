import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { AuthService } from '../../services/auth.service';
import { Solicitud } from '../../models/solicitud.models';
import { UserSession } from '../../models/auth.models';

/**
 * Componente Standalone de Dashboard y Gestión de Solicitudes (CRUD Completo).
 * Implementa consumo de operaciones GET, POST, PUT y DELETE conectadas a la UI.
 */
@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes.component.html'
})
export class SolicitudesComponent implements OnInit {

  private readonly solicitudService = inject(SolicitudService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  solicitudes: Solicitud[] = [];
  currentUser: UserSession | null = null;
  isLoading = false;
  showCreateModal = false;
  alertaMensaje: string | null = null;
  alertaTipo: 'success' | 'danger' = 'success';

  // Modelo reactivo para el formulario de creación
  nuevaSolicitud: Solicitud = {
    plataforma: 'AWS Cloud',
    usuarioSolicitanteId: 1,
    tipoAcceso: 'LECTURA',
    motivo: '',
    justificacion: '',
    estado: 'PENDIENTE'
  };

  ngOnInit(): void {
    this.currentUser = this.authService.getUserSession();
    if (this.currentUser?.id) {
      this.nuevaSolicitud.usuarioSolicitanteId = this.currentUser.id;
    }
    this.cargarSolicitudes();
  }

  /**
   * 1. GET: Carga el listado de solicitudes desde el API Gateway.
   */
  cargarSolicitudes(): void {
    this.isLoading = true;
    this.solicitudService.getSolicitudes().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.mostrarAlerta('Error al cargar solicitudes desde el API Gateway.', 'danger');
        this.isLoading = false;
      }
    });
  }

  /**
   * Abre el modal/formulario para crear una nueva solicitud.
   */
  abrirModalCrear(): void {
    const currentUserId = this.currentUser?.id ?? 1;
    this.nuevaSolicitud = {
      plataforma: 'AWS Cloud',
      usuarioSolicitanteId: currentUserId,
      tipoAcceso: 'LECTURA',
      motivo: '',
      justificacion: '',
      estado: 'PENDIENTE'
    };
    this.showCreateModal = true;
  }

  cerrarModal(): void {
    this.showCreateModal = false;
  }

  /**
   * 2. POST: Envía y registra una nueva solicitud (valida con auth-service vía OpenFeign).
   */
  guardarSolicitud(): void {
    const textoMotivo = (this.nuevaSolicitud.motivo || this.nuevaSolicitud.justificacion || '').trim();
    if (!this.nuevaSolicitud.plataforma || !textoMotivo) {
      this.mostrarAlerta('Por favor, complete todos los campos obligatorios (Plataforma y Justificación / Motivo).', 'danger');
      return;
    }

    if (!this.nuevaSolicitud.usuarioSolicitanteId) {
      this.nuevaSolicitud.usuarioSolicitanteId = this.currentUser?.id ?? 1;
    }

    const payload: Solicitud = {
      ...this.nuevaSolicitud,
      motivo: textoMotivo,
      justificacion: textoMotivo
    };

    this.solicitudService.crearSolicitud(payload).subscribe({
      next: (creada) => {
        this.mostrarAlerta(`Solicitud #${creada.id ?? ''} registrada exitosamente para ${creada.plataforma}.`, 'success');
        this.cerrarModal();
        this.cargarSolicitudes();
      },
      error: (err) => {
        const errorMsg = err.error?.message || err.error?.mensaje || err.message || 'Error al crear la solicitud.';
        this.mostrarAlerta(errorMsg, 'danger');
      }
    });
  }

  /**
   * 3. PUT: Actualiza el estado de una solicitud (Aprobar o Rechazar).
   */
  cambiarEstado(id: number | undefined, nuevoEstado: string): void {
    if (!id) return;

    this.solicitudService.actualizarEstado(id, nuevoEstado).subscribe({
      next: (actualizada) => {
        this.mostrarAlerta(`Solicitud #${id} cambiada a estado: ${nuevoEstado}.`, 'success');
        this.cargarSolicitudes();
      },
      error: (err) => {
        this.mostrarAlerta(`Error al actualizar estado de la solicitud #${id}.`, 'danger');
      }
    });
  }

  /**
   * 4. DELETE: Elimina una solicitud por su ID.
   */
  eliminar(id: number | undefined): void {
    if (!id) return;

    if (confirm(`¿Está seguro de eliminar permanentemente la solicitud #${id}?`)) {
      this.solicitudService.eliminarSolicitud(id).subscribe({
        next: () => {
          this.mostrarAlerta(`Solicitud #${id} eliminada correctamente.`, 'success');
          this.cargarSolicitudes();
        },
        error: (err) => {
          this.mostrarAlerta(`No se pudo eliminar la solicitud #${id}.`, 'danger');
        }
      });
    }
  }

  /**
   * Cierra sesión y redirige al Login.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private mostrarAlerta(mensaje: string, tipo: 'success' | 'danger'): void {
    this.alertaMensaje = mensaje;
    this.alertaTipo = tipo;
    setTimeout(() => {
      this.alertaMensaje = null;
    }, 4500);
  }
}
