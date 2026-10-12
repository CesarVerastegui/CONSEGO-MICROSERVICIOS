export interface CampoPersonalizado {
  id: string;
  etiqueta: string;
  tipo: 'text' | 'select' | 'number' | 'textarea' | string;
  placeholder?: string;
  requerido: boolean;
  opciones?: string[];
}

export interface Plataforma {
  id?: number;
  nombre: string;
  categoria: string;
  criticidad: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA' | string;
  descripcion?: string;
  icono?: string;
  activa: boolean;
  camposPersonalizados?: CampoPersonalizado[];
  fechaCreacion?: string;
}
