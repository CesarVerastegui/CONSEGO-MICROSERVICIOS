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

    getSolicitudes(usuarioId?: number): Observable<Solicitud[]> {
    const url = usuarioId ? `${this.baseUrl}?usuarioId=${usuarioId}` : this.baseUrl;
    return this.http.get<Solicitud[]>(url);
  }

    getSolicitudById(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.baseUrl}/${id}`);
  }

    crearSolicitud(data: Solicitud): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.baseUrl, data);
  }

    actualizarSolicitud(id: number, data: Partial<Solicitud>): Observable<Solicitud> {
    return this.http.put<Solicitud>(`${this.baseUrl}/${id}`, data);
  }

    aprobarSolicitud(id: number, comentario: string): Observable<Solicitud> {
    const payload: ResolucionRequest = {
      nuevoEstado: 'APROBADA',
      comentario
    };
    return this.http.put<Solicitud>(`${this.baseUrl}/${id}/aprobar`, payload);
  }

    rechazarSolicitud(id: number, comentario: string): Observable<Solicitud> {
    const payload: ResolucionRequest = {
      nuevoEstado: 'RECHAZADA',
      comentario
    };
    return this.http.put<Solicitud>(`${this.baseUrl}/${id}/rechazar`, payload);
  }

    eliminarSolicitud(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
