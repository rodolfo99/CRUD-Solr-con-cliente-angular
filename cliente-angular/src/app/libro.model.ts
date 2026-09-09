export interface Libro {
  id: string;
  titulo: string;
  autor: string;
  anio: number;
}

export type LibroRequest = Omit<Libro, 'id'>;

export interface Pagina<T> {
  contenido: T[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}

export type Filtro = { campo: 'titulo' | 'autor'; valor: string };
