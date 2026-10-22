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

    getPlataformas(soloActivas: boolean = false): Observable<Plataforma[]> {
    return this.http.get<Plataforma[]>(`${this.baseUrl}?soloActivas=${soloActivas}`);
  }

    getPlataformaById(id: number): Observable<Plataforma> {
    return this.http.get<Plataforma>(`${this.baseUrl}/${id}`);
  }

    crearPlataforma(data: Plataforma): Observable<Plataforma> {
    return this.http.post<Plataforma>(this.baseUrl, data);
  }

    actualizarPlataforma(id: number, data: Plataforma): Observable<Plataforma> {
    return this.http.put<Plataforma>(`${this.baseUrl}/${id}`, data);
  }

    toggleEstado(id: number, activa: boolean): Observable<Plataforma> {
    return this.http.put<Plataforma>(`${this.baseUrl}/${id}/status`, { activa });
  }

    eliminarPlataforma(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
