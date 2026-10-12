export interface AuditLog {
  id?: string;
  tipoEvento: 'SOLICITUD_CREADA' | 'SOLICITUD_ACTUALIZADA' | 'SOLICITUD_ELIMINADA' | string;
  entidadId: number;
  usuarioId: number;
  fechaEvento: string;
  detalle: string;
  metadatos?: Record<string, any>;
}
