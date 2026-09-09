package mx.ejemplo.solr;

import com.tomaytotomato.data.solr.repository.SolrRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

// En Lazarus 1.0.0 el ID siempre es String: solo hay un parámetro genérico.
public interface LibroRepository extends SolrRepository<Libro> {
    Page<Libro> findByTituloContaining(String titulo, Pageable pageable);
    Page<Libro> findByAutor(String autor, Pageable pageable);
}
