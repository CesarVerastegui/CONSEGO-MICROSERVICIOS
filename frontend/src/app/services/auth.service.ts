import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthRequest, AuthResponse, UserSession } from '../models/auth.models';

/**
 * Servicio de Autenticación para gestionar el inicio de sesión y el almacenamiento del token JWT.
 * Consume los endpoints del API Gateway en http://localhost:8080/api/auth.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'consego_jwt_token';
  private readonly USER_KEY = 'consego_user_session';

  /**
   * Realiza la petición POST de autenticación hacia el API Gateway.
   * Almacena el token y los datos de sesión en caso de éxito.
   */
  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        if (response && response.token) {
          this.setToken(response.token);
          this.setUserSession({
            id: response.id,
            username: response.username,
            role: response.role,
            token: response.token
          });
        }
      })
    );
  }

  /**
   * Registro opcional de nuevos usuarios.
   */
  register(data: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data);
  }

  /**
   * Guarda el token JWT en el localStorage.
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Recupera el token JWT desde el localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Almacena el perfil del usuario autenticado.
   */
  setUserSession(session: UserSession): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(session));
  }

  /**
   * Obtiene la sesión actual del usuario.
   */
  getUserSession(): UserSession | null {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Cierra la sesión activa eliminando las credenciales almacenadas.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Comprueba si el usuario tiene una sesión activa mediante la presencia del token.
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
