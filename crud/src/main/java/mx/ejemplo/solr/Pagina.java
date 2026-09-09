package mx.ejemplo.solr;

import java.util.List;
import org.springframework.data.domain.Page;

public record Pagina<T>(List<T> contenido, int pagina, int tamanio,
                        long totalElementos, int totalPaginas) {
    public static <T> Pagina<T> de(Page<T> pagina) {
        return new Pagina<>(pagina.getContent(), pagina.getNumber(), pagina.getSize(),
                pagina.getTotalElements(), pagina.getTotalPages());
    }
}
