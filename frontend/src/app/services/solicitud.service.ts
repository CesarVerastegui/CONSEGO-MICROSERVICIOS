import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solicitud, ResolucionRequest } from '../models/solicitud.models';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/solicitudes';

  /**
   * 1. GET: Retorna la lista de solicitudes (global o por usuario solicitante).
   */
  getSolicitudes(usuarioId?: number): Observable<Solicitud[]> {
    const url = usuarioId ? `${this.baseUrl}?usuarioId=${usuarioId}` : this.baseUrl;
    return this.http.get<Solicitud[]>(url);
  }

  /**
   * 1.1 GET: Retorna una solicitud específica por su ID.
   */
  getSolicitudById(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.baseUrl}/${id}`);
  }

  /**
   * 2. POST: Registrar una nueva solicitud.
   */
  crearSolicitud(data: Solicitud): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.baseUrl, data);
  }

  /**
   * 3. PUT: Actualizar solicitud existente.
   */
  actualizarSolicitud(id: number, data: Partial<Solicitud>): Observable<Solicitud> {
    return this.http.put<Solicitud>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * 3.1 PUT: Aprobar solicitud con comentario obligatorio de resolución.
   */
  aprobarSolicitud(id: number, comentario: string): Observable<Solicitud> {
    const payload: ResolucionRequest = {
      nuevoEstado: 'APROBADA',
      comentario
    };
    return this.http.put<Solicitud>(`${this.baseUrl}/${id}/aprobar`, payload);
  }

  /**
   * 3.2 PUT: Rechazar solicitud con comentario obligatorio de resolución.
   */
  rechazarSolicitud(id: number, comentario: string): Observable<Solicitud> {
    const payload: ResolucionRequest = {
      nuevoEstado: 'RECHAZADA',
      comentario
    };
    return this.http.put<Solicitud>(`${this.baseUrl}/${id}/rechazar`, payload);
  }

  /**
   * 4. DELETE: Eliminar la solicitud especificada.
   */
  eliminarSolicitud(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
