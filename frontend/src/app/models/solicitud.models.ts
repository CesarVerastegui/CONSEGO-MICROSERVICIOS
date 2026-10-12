export interface Solicitud {
  id?: number;
  plataforma: string;
  usuarioSolicitanteId: number;
  estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | string;
  motivo?: string;
  justificacion?: string;
  comentarioResolucion?: string;
  vigenciaDias?: number;
  fechaCaducidad?: string;
  detallesServicio?: Record<string, any>;
  fechaCreacion?: string;
}

export interface ResolucionRequest {
  nuevoEstado: string;
  comentario?: string;
}
