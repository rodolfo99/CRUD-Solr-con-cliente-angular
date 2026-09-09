import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { Libro, Pagina } from './libro.model';

describe('Flujos del catálogo', () => {
  let app: AppComponent;
  let http: HttpTestingController;
  const libro: Libro = { id: 'libro-1', titulo: 'Spring en acción', autor: 'Craig Walls', anio: 2022 };
  const pagina = (contenido: Libro[], indice = 0, total = contenido.length): Pagina<Libro> => ({
    contenido, pagina: indice, tamanio: 10, totalElementos: total, totalPaginas: Math.ceil(total / 10)
  });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    app = TestBed.runInInjectionContext(() => new AppComponent());
    app.editor = new ElementRef({ showModal: vi.fn(), close: vi.fn() } as unknown as HTMLDialogElement);
    app.borrado = new ElementRef({ showModal: vi.fn(), close: vi.fn() } as unknown as HTMLDialogElement);
    http.expectOne('/api/libros?pagina=0&tamanio=10').flush(pagina([libro]));
  });
  afterEach(() => { http.verify(); TestBed.resetTestingModule(); });

  it('rechaza espacios en blanco y años fraccionarios antes de enviar datos', () => {
    app.nuevo();
    app.formulario.setValue({ titulo: '   ', autor: 'Autor', anio: 2022.5 });
    app.guardar();
    expect(app.formulario.invalid).toBe(true);
    expect(app.guardando()).toBe(false);
    http.expectNone(req => req.method === 'POST');
  });

  it('envía solo el filtro elegido y reinicia la página', () => {
    app.pagina.set(3);
    app.busqueda.setValue({ campo: 'autor', valor: '  José Pérez  ' });
    app.buscar();
    const req = http.expectOne(req => req.url === '/api/libros');
    expect(req.request.params.get('pagina')).toBe('0');
    expect(req.request.params.get('autor')).toBe('José Pérez');
    expect(req.request.params.has('titulo')).toBe(false);
    req.flush(pagina([]));
    expect(app.datos()?.totalElementos).toBe(0);
  });

  it('conserva el formulario ante un fallo y bloquea envíos duplicados', () => {
    app.nuevo();
    app.formulario.setValue({ titulo: 'Nuevo libro', autor: 'Autora', anio: 2026 });
    app.guardar();
    app.guardar();
    const req = http.expectOne(req => req.method === 'POST' && req.url === '/api/libros');
    req.flush({}, { status: 503, statusText: 'Service Unavailable' });
    expect(app.formulario.getRawValue().titulo).toBe('Nuevo libro');
    expect(app.guardando()).toBe(false);
    expect(app.editor.nativeElement.close).not.toHaveBeenCalled();
    expect(app.errorFormulario()).toContain('Comprueba el catálogo');
  });

  it('lee el documento actual antes de editar y conserva el ID en PUT', () => {
    app.editar(libro);
    http.expectOne('/api/libros/libro-1').flush({ ...libro, titulo: 'Título más reciente' });
    expect(app.formulario.controls.titulo.value).toBe('Título más reciente');
    app.formulario.controls.anio.setValue(2026);
    app.guardar();
    const req = http.expectOne('/api/libros/libro-1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ titulo: 'Título más reciente', autor: 'Craig Walls', anio: 2026 });
    req.flush({ ...libro, titulo: 'Título más reciente', anio: 2026 });
    http.expectOne('/api/libros?pagina=0&tamanio=10').flush(pagina([libro]));
    expect(app.editor.nativeElement.close).toHaveBeenCalledOnce();
  });

  it('al borrar el último elemento de una página vuelve a una página válida', () => {
    app.pagina.set(1);
    app.pedirEliminar(libro);
    app.eliminar();
    const borrar = http.expectOne('/api/libros/libro-1');
    expect(borrar.request.method).toBe('DELETE');
    borrar.flush(null, { status: 204, statusText: 'No Content' });
    http.expectOne('/api/libros?pagina=1&tamanio=10').flush(pagina([], 1, 10));
    http.expectOne('/api/libros?pagina=0&tamanio=10').flush(pagina([libro], 0, 10));
    expect(app.pagina()).toBe(0);
    expect(app.cargando()).toBe(false);
    expect(app.borrado.nativeElement.close).toHaveBeenCalledOnce();
  });

  it('al crear limpia el filtro anterior y utiliza el ID devuelto por el servidor', () => {
    app.filtro.set({ campo: 'autor', valor: 'Otro autor' });
    app.nuevo();
    app.formulario.setValue({ titulo: ' Nuevo ', autor: ' Autora ', anio: 2026 });
    app.guardar();
    const req = http.expectOne('/api/libros');
    expect(req.request.body).toEqual({ titulo: 'Nuevo', autor: 'Autora', anio: 2026 });
    req.flush({ id: 'uuid-del-servidor', ...req.request.body });
    http.expectOne('/api/libros?pagina=0&tamanio=10').flush(pagina([]));
    expect(app.filtro()).toBeUndefined();
    expect(app.aviso()).toContain('libro creado');
  });
});
