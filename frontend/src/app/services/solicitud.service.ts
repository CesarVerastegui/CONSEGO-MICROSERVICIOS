import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solicitud } from '../models/solicitud.models';

/**
 * Servicio de Negocio para la gestión de Solicitudes de Acceso.
 * Conecta con el API Gateway en http://localhost:8080/api/solicitudes
 * e implementa los 4 métodos HTTP requeridos por la rúbrica institucional (GET, POST, PUT, DELETE).
 */
@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/solicitudes';

  /**
   * 1. GET: Retorna un Observable con la lista completa de solicitudes.
   * GET http://localhost:8080/api/solicitudes
   */
  getSolicitudes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.baseUrl);
  }

  /**
   * 1.1 GET: Retorna una solicitud específica por su ID.
   * GET http://localhost:8080/api/solicitudes/{id}
   */
  getSolicitudById(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.baseUrl}/${id}`);
  }

  /**
   * 2. POST: Retorna un Observable enviando una nueva solicitud.
   * POST http://localhost:8080/api/solicitudes
   */
  crearSolicitud(data: Solicitud): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.baseUrl, data);
  }

  /**
   * 3. PUT: Retorna un Observable actualizando una solicitud o cambiando su estado (Aprobar/Rechazar).
   * PUT http://localhost:8080/api/solicitudes/{id}
   */
  actualizarSolicitud(id: number, data: Partial<Solicitud>): Observable<Solicitud> {
    return this.http.put<Solicitud>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * 3.1 PUT (Variante): Actualiza únicamente el estado de la solicitud.
   * PUT http://localhost:8080/api/solicitudes/{id}/estado?nuevoEstado={estado}
   */
  actualizarEstado(id: number, nuevoEstado: string): Observable<Solicitud> {
    const params = new HttpParams().set('nuevoEstado', nuevoEstado);
    return this.http.put<Solicitud>(`${this.baseUrl}/${id}/estado`, {}, { params });
  }

  /**
   * 4. DELETE: Retorna un Observable eliminando la solicitud especificada.
   * DELETE http://localhost:8080/api/solicitudes/{id}
   */
  eliminarSolicitud(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
