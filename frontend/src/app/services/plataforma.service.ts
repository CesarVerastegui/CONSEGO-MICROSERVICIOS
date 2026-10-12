import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plataforma } from '../models/plataforma.models';

@Injectable({
  providedIn: 'root'
})
export class PlataformaService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/plataformas';

  /**
   * Listar todas las plataformas (o sólo las activas).
   */
  getPlataformas(soloActivas: boolean = false): Observable<Plataforma[]> {
    return this.http.get<Plataforma[]>(`${this.baseUrl}?soloActivas=${soloActivas}`);
  }

  /**
   * Obtener detalle de una plataforma por ID.
   */
  getPlataformaById(id: number): Observable<Plataforma> {
    return this.http.get<Plataforma>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crear una nueva plataforma tecnológica en el catálogo.
   */
  crearPlataforma(data: Plataforma): Observable<Plataforma> {
    return this.http.post<Plataforma>(this.baseUrl, data);
  }

  /**
   * Actualizar plataforma existente.
   */
  actualizarPlataforma(id: number, data: Plataforma): Observable<Plataforma> {
    return this.http.put<Plataforma>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Conmutar estado activa / inactiva.
   */
  toggleEstado(id: number, activa: boolean): Observable<Plataforma> {
    return this.http.put<Plataforma>(`${this.baseUrl}/${id}/status`, { activa });
  }

  /**
   * Eliminar plataforma por ID.
   */
  eliminarPlataforma(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
