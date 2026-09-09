import { Component, DestroyRef, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { LibrosService } from './libros.service';
import { Filtro, Libro, Pagina } from './libro.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private readonly api = inject(LibrosService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private consulta?: Subscription;
  @ViewChild('editor') editor!: ElementRef<HTMLDialogElement>;
  @ViewChild('borrado') borrado!: ElementRef<HTMLDialogElement>;

  readonly datos = signal<Pagina<Libro> | null>(null);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly preparando = signal(false);
  readonly error = signal('');
  readonly errorFormulario = signal('');
  readonly errorBorrado = signal('');
  readonly aviso = signal('');
  readonly editando = signal<string | null>(null);
  readonly porEliminar = signal<Libro | null>(null);
  readonly pagina = signal(0);
  readonly tamanio = signal(10);
  readonly filtro = signal<Filtro | undefined>(undefined);
  readonly ocupado = computed(() => this.guardando() || this.preparando());
  readonly desde = computed(() => this.datos()?.contenido.length ? this.pagina() * this.tamanio() + 1 : 0);
  readonly hasta = computed(() => this.pagina() * this.tamanio() + (this.datos()?.contenido.length ?? 0));

  readonly busqueda = this.fb.nonNullable.group({
    campo: this.fb.nonNullable.control<'titulo' | 'autor'>('titulo'),
    valor: ['']
  });
  readonly formulario = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(300)]],
    autor: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(1), Validators.max(9999), Validators.pattern(/^\d+$/)]]
  });

  constructor() { this.cargar(); }

  cargar() {
    this.consulta?.unsubscribe();
    this.cargando.set(true);
    this.error.set('');
    this.consulta = this.api.listar(this.pagina(), this.tamanio(), this.filtro())
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: datos => {
          if (datos.contenido.length === 0 && this.pagina() > 0) {
            this.pagina.set(Math.max(0, datos.totalPaginas - 1));
            this.cargar();
            return;
          }
          this.datos.set(datos);
          this.cargando.set(false);
        },
        error: error => { this.cargando.set(false); this.error.set(this.mensajeError(error)); }
      });
  }

  buscar() {
    if (this.ocupado()) return;
    const valor = this.busqueda.getRawValue();
    this.filtro.set(valor.valor.trim() ? { campo: valor.campo, valor: valor.valor.trim() } : undefined);
    this.pagina.set(0);
    this.cargar();
  }
  limpiar() {
    this.busqueda.reset({ campo: 'titulo', valor: '' });
    this.buscar();
  }
  cambiarPagina(incremento: number) {
    const nueva = this.pagina() + incremento;
    if (this.cargando() || this.ocupado() || nueva < 0 || nueva >= (this.datos()?.totalPaginas ?? 0)) return;
    this.pagina.set(nueva);
    this.cargar();
  }
  cambiarTamanio(valor: string) {
    this.tamanio.set(Number(valor));
    this.pagina.set(0);
    this.cargar();
  }

  nuevo() {
    if (this.ocupado()) return;
    this.editando.set(null);
    this.formulario.reset({ titulo: '', autor: '', anio: new Date().getFullYear() });
    this.errorFormulario.set('');
    this.editor.nativeElement.showModal();
  }
  editar(libro: Libro) {
    if (this.ocupado()) return;
    this.preparando.set(true);
    this.aviso.set('');
    this.api.obtener(libro.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: actual => {
        this.preparando.set(false);
        this.editando.set(actual.id);
        this.formulario.reset({ titulo: actual.titulo, autor: actual.autor, anio: actual.anio });
        this.errorFormulario.set('');
        this.editor.nativeElement.showModal();
      },
      error: error => { this.preparando.set(false); this.error.set(this.mensajeError(error)); }
    });
  }
  cerrarEditor() {
    if (!this.guardando()) this.editor.nativeElement.close();
  }
  cancelarDialogo(event: Event) {
    if (this.guardando()) event.preventDefault();
  }
  invalido(campo: 'titulo' | 'autor' | 'anio') {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }
  guardar() {
    if (this.guardando()) return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const valores = this.formulario.getRawValue();
    const datos = { ...valores, titulo: valores.titulo.trim(), autor: valores.autor.trim() };
    const id = this.editando();
    this.guardando.set(true);
    this.errorFormulario.set('');
    const peticion = id ? this.api.actualizar(id, datos) : this.api.crear(datos);
    peticion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: libro => {
        this.guardando.set(false);
        this.editor.nativeElement.close();
        this.aviso.set(`«${libro.titulo}»: ${id ? 'cambios guardados' : 'libro creado'}.`);
        if (!id) {
          this.busqueda.reset({ campo: 'titulo', valor: '' });
          this.filtro.set(undefined);
          this.pagina.set(0);
        }
        this.cargar();
      },
      error: error => {
        this.guardando.set(false);
        this.errorFormulario.set(this.mensajeError(error, true));
      }
    });
  }

  pedirEliminar(libro: Libro) {
    this.porEliminar.set(libro);
    this.errorBorrado.set('');
    this.borrado.nativeElement.showModal();
  }
  cerrarBorrado() {
    if (!this.guardando()) this.borrado.nativeElement.close();
  }
  eliminar() {
    const libro = this.porEliminar();
    if (!libro || this.guardando()) return;
    this.guardando.set(true);
    this.errorBorrado.set('');
    this.api.eliminar(libro.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.guardando.set(false);
        this.borrado.nativeElement.close();
        this.porEliminar.set(null);
        this.aviso.set(`«${libro.titulo}»: libro eliminado.`);
        this.cargar();
      },
      error: error => {
        this.guardando.set(false);
        this.errorBorrado.set(this.mensajeError(error, true));
      }
    });
  }

  private mensajeError(error: unknown, escritura = false): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0 || error.status >= 500) {
        return escritura
          ? 'No se pudo confirmar la operación. Comprueba el catálogo antes de intentarlo de nuevo.'
          : 'No se pudo cargar el catálogo. Comprueba que el servidor esté iniciado y vuelve a intentarlo.';
      }
      if (error.status === 404) return 'El libro ya no existe. Cierra este formulario y actualiza el catálogo.';
      if (error.status === 400) return 'Revisa los datos: título y autor son obligatorios; el año debe estar entre 1 y 9999.';
      return `La solicitud no pudo completarse (HTTP ${error.status}).`;
    }
    return 'Ocurrió un error inesperado. Vuelve a intentarlo.';
  }
}
