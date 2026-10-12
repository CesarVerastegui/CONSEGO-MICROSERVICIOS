import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLog } from '../models/audit.models';

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/audit';

  /**
   * Listar todos los logs de auditoría persistidos en MongoDB ordenados por fecha descendente.
   */
  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.baseUrl);
  }

  /**
   * Filtrar logs de auditoría por ID de solicitud (entidadId).
   */
  getAuditLogsBySolicitud(id: number): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/solicitud/${id}`);
  }

  /**
   * Filtrar logs de auditoría por ID de usuario.
   */
  getAuditLogsByUsuario(id: number): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/usuario/${id}`);
  }
}
