package mx.ejemplo.solr;

import com.tomaytotomato.data.solr.mapping.SolrEntity;
import org.apache.solr.client.solrj.beans.Field;

@SolrEntity(collection = "libros")
public class Libro {
    @Field("id")
    private String id;
    @Field("titulo_s")
    private String titulo;
    @Field("autor_s")
    private String autor;
    @Field("anio_i")
    private Integer anio;

    public Libro() {} // Necesario para el lector de documentos de Lazarus.

    public Libro(String id, String titulo, String autor, Integer anio) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.anio = anio;
    }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }
}
