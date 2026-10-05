export interface Solicitud {
  id?: number;
  plataforma: string;
  usuarioSolicitanteId: number;
  estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'IMPLEMENTADA' | string;
  motivo?: string;
  justificacion?: string;
  tipoAcceso?: 'LECTURA' | 'ESCRITURA' | 'ADMIN' | string;
  fechaCreacion?: string;
  fechaSolicitud?: string;
}
