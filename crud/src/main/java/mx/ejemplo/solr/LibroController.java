package mx.ejemplo.solr;

import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/libros")
public class LibroController {
    private final LibroService service;

    public LibroController(LibroService service) {
        this.service = service;
    }
    @PostMapping
    public ResponseEntity<Libro> crear(@Valid @RequestBody LibroRequest datos) {
        Libro libro = service.crear(datos);
        return ResponseEntity.created(URI.create("/api/libros/" + libro.getId())).body(libro);
    }
    @GetMapping
    public Pagina<Libro> listar(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanio,
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) String autor) {
        return service.listar(pagina, tamanio, titulo, autor);
    }
    @GetMapping("/{id}")
    public Libro obtener(@PathVariable String id) {
        return service.obtener(id);
    }
    @PutMapping("/{id}")
    public Libro actualizar(@PathVariable String id, @Valid @RequestBody LibroRequest datos) {
        return service.actualizar(id, datos);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable String id) {
        service.eliminar(id);
    }
}
