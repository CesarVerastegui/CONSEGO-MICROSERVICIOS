export interface AuthRequest {
  username: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  role: string;
}

export interface UserSession {
  id: number;
  username: string;
  role: string;
  token: string;
}
