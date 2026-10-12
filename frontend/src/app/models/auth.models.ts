export interface AuthRequest {
  username?: string;
  correo?: string;
  password?: string;
  nombres?: string;
  apellidos?: string;
  rol?: string;
  role?: string;
}

export interface AuthResponse {
  token?: string;
  type?: string;
  id?: number;
  username?: string;
  correo?: string;
  nombres?: string;
  apellidos?: string;
  role: string;
  rol?: string;
  activo?: boolean;
  mensaje?: string;
}

export interface UserSession {
  id: number;
  username: string;
  correo?: string;
  nombres?: string;
  apellidos?: string;
  role: string;
  token: string;
}

export interface UserResponse {
  id: number;
  username: string;
  correo?: string;
  nombres?: string;
  apellidos?: string;
  rol: string;
  activo: boolean;
  estadoAdmision?: string;
  motivoRechazo?: string;
  fechaRegistro?: string;
  fechaAprobacion?: string;
  exists: boolean;
}

export interface UpdateRoleRequest {
  rol: string;
}

export interface UpdateStatusRequest {
  activo: boolean;
}

export interface RechazoUsuarioRequest {
  motivo: string;
}
