import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Filtro, Libro, LibroRequest, Pagina } from './libro.model';

@Injectable({ providedIn: 'root' })
export class LibrosService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/libros';

  listar(pagina = 0, tamanio = 10, filtro?: Filtro) {
    let params = new HttpParams().set('pagina', pagina).set('tamanio', tamanio);
    if (filtro?.valor.trim()) {
      params = params.set(filtro.campo, filtro.valor.trim());
    }
    return this.http.get<Pagina<Libro>>(this.url, { params });
  }

  obtener(id: string) {
    return this.http.get<Libro>(`${this.url}/${encodeURIComponent(id)}`);
  }

  crear(libro: LibroRequest) {
    return this.http.post<Libro>(this.url, libro);
  }

  actualizar(id: string, libro: LibroRequest) {
    return this.http.put<Libro>(`${this.url}/${encodeURIComponent(id)}`, libro);
  }

  eliminar(id: string) {
    return this.http.delete<void>(`${this.url}/${encodeURIComponent(id)}`);
  }
}
