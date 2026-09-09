package mx.ejemplo.solr;

import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LibroService {
    private final LibroRepository repository;

    public LibroService(LibroRepository repository) {
        this.repository = repository;
    }
    public Libro crear(LibroRequest datos) {
        return repository.save(new Libro(UUID.randomUUID().toString(),
                datos.titulo().trim(), datos.autor().trim(), datos.anio()));
    }
    public Libro obtener(String id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Libro no encontrado"));
    }
    public Pagina<Libro> listar(int pagina, int tamanio, String titulo, String autor) {
        if (pagina < 0 || tamanio < 1 || tamanio > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "pagina debe ser >= 0; tamanio debe estar entre 1 y 100");
        }
        boolean porTitulo = titulo != null && !titulo.isBlank();
        boolean porAutor = autor != null && !autor.isBlank();
        if (porTitulo && porAutor) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Usa solo un filtro: titulo o autor");
        }
        var pageable = PageRequest.of(pagina, tamanio, Sort.by("id"));
        if (porTitulo) {
            return Pagina.de(repository.findByTituloContaining(titulo.trim(), pageable));
        }
        if (porAutor) {
            return Pagina.de(repository.findByAutor(autor.trim(), pageable));
        }
        return Pagina.de(repository.findAll(pageable));
    }
    public Libro actualizar(String id, LibroRequest datos) {
        Libro libro = obtener(id);
        libro.setTitulo(datos.titulo().trim());
        libro.setAutor(datos.autor().trim());
        libro.setAnio(datos.anio());
        return repository.save(libro);
    }
    public void eliminar(String id) {
        obtener(id);
        repository.deleteById(id);
    }
}
