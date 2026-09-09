package mx.ejemplo.solr;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LibroRequest(
        @NotBlank @Size(max = 300) String titulo,
        @NotBlank @Size(max = 200) String autor,
        @NotNull @Min(1) @Max(9999) Integer anio) {
}
