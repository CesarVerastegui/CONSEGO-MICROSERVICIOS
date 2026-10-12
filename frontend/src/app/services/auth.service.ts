import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  AuthRequest,
  AuthResponse,
  UserResponse,
  UserSession,
  UpdateRoleRequest,
  UpdateStatusRequest
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'consego_jwt_token';
  private readonly USER_KEY = 'consego_user_session';

  /**
   * Login con credenciales.
   */
  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        if (response && response.token) {
          const rol = response.rol || response.role || 'Solicitante';
          this.setToken(response.token);
          this.setUserSession({
            id: response.id || 0,
            username: response.username || '',
            correo: response.correo,
            nombres: response.nombres,
            apellidos: response.apellidos,
            role: rol,
            token: response.token
          });
        }
      })
    );
  }

  /**
   * Registro público (siempre crea con rol Solicitante / Operador).
   */
  register(data: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data);
  }

  /**
   * Listar todos los usuarios para la consola de administración IAM.
   */
  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.baseUrl}/users`);
  }

  /**
   * Crear un usuario desde el panel de administración IAM con rol específico.
   */
  createUserAdmin(data: AuthRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/users`, data);
  }

  /**
   * Elevar o cambiar el rol de un usuario.
   */
  updateUserRole(id: number, rol: string): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.baseUrl}/users/${id}/role`, { rol });
  }

  /**
   * Aprobar / Admitir cuenta preliminar de usuario.
   */
  aprobarUsuario(id: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.baseUrl}/users/${id}/aprobar`, {});
  }

  /**
   * Rechazar solicitud de admisión de usuario con motivo.
   */
  rechazarUsuario(id: number, motivo: string): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.baseUrl}/users/${id}/rechazar`, { motivo });
  }

  /**
   * Activar o desactivar cuenta de usuario.
   */
  updateUserStatus(id: number, activo: boolean): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.baseUrl}/users/${id}/status`, { activo });
  }

  /**
   * Eliminar usuario por ID.
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setUserSession(session: UserSession): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(session));
  }

  getUserSession(): UserSession | null {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string {
    const session = this.getUserSession();
    return session ? (session.role || 'Solicitante') : '';
  }

  isAdmin(): boolean {
    const role = this.getRole().toLowerCase();
    return role === 'admin' || role === 'administrador';
  }

  isAuditor(): boolean {
    const role = this.getRole().toLowerCase();
    return role === 'auditor';
  }

  isSolicitante(): boolean {
    const role = this.getRole().toLowerCase();
    return role === 'solicitante' || role === 'operador';
  }
}
