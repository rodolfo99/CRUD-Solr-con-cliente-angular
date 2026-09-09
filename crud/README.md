# CRUD con Spring Data Solr Lazarus

API REST de libros con entidad, repositorio Spring Data, servicio y controlador.
Ejemplo independiente para desarrollo local.

## Versiones

- Java 21 o superior (el proyecto compila para Java 21).
- Spring Boot 4.0.6.
- `com.tomaytotomato:solr-spring-boot-starter:1.0.0`.
- Apache Solr 10.0.0.
- Maven 3.6.3 o superior y Docker con Compose v2.

Se eligieron las versiones base del POM publicado de Lazarus 1.0.0. No se afirma
que Spring Boot 4.0.6 sea la última versión de Spring Boot. La metadata consultada
el 5 de septiembre de 2026 lista 1.0.0 como última release del starter.

Lazarus es una reimplementación comunitaria; no es el módulo oficial archivado
`org.springframework.data:spring-data-solr`. Este ejemplo no presupone
compatibilidad con Spring Boot 3.x ni con el Solr de una instalación de DSpace.

## Ejecutar

Desde el directorio del proyecto:

```bash
java -version
mvn -version
docker compose up -d --wait
mvn spring-boot:run
```

Solr: http://localhost:8984/solr/
API: http://localhost:8081/api/libros

Los puertos 8984 y 8081 evitan ocupar los habituales 8983 y 8080.
Compose crea el core `libros` usando el configset `_default`. El volumen conserva
los documentos al detener los contenedores.

Para generar y ejecutar el JAR:

```bash
mvn clean package
java -jar target/crud-spring-data-solr-1.0.0.jar
```

Para apuntar a otro servidor compatible que ya tenga el core `libros` y sus campos:

```bash
SOLR_URL=http://localhost:8983/solr PORT=8081 mvn spring-boot:run
```

No apuntes este ejemplo a un core de DSpace: utiliza un core independiente.

## Prueba del CRUD con curl

### Crear

```bash
curl -i -X POST http://localhost:8081/api/libros \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"Spring en accion","autor":"Craig Walls","anio":2022}'
```

Respuesta: HTTP 201, cabecera `Location` y JSON con un UUID generado por la API.
Copia ese `id` para los siguientes comandos:

```bash
LIBRO_ID='PEGA-AQUI-EL-ID-DEVUELTO'
```

### Listar y obtener

```bash
curl -sS 'http://localhost:8081/api/libros?pagina=0&tamanio=20'
curl -sS "http://localhost:8081/api/libros/$LIBRO_ID"
```

El listado devuelve `contenido`, `pagina`, `tamanio`, `totalElementos` y
`totalPaginas`. Las páginas empiezan en cero, el tamaño permitido es 1–100
y el orden es por ID para que sea determinista mientras los datos no cambien.

### Buscar

```bash
curl -sS --get http://localhost:8081/api/libros \
  --data-urlencode 'titulo=Spring' \
  --data-urlencode 'pagina=0' --data-urlencode 'tamanio=20'

curl -sS --get http://localhost:8081/api/libros \
  --data-urlencode 'autor=Craig Walls'
```

`titulo` busca una subcadena mediante `findByTituloContaining` y `autor` busca
una coincidencia exacta. Solo se admite un filtro por solicitud.
Los campos `*_s` son de tipo `string`: las búsquedas distinguen mayúsculas y
acentos. Este CRUD no implementa relevancia lingüística ni búsqueda aproximada;
para eso hay que definir campos de texto con analizadores apropiados.

### Actualizar

```bash
curl -i -X PUT "http://localhost:8081/api/libros/$LIBRO_ID" \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"Spring en accion actualizado","autor":"Craig Walls","anio":2026}'
```

HTTP 200. PUT sustituye todos los datos editables y conserva el ID.
Devuelve HTTP 404 si el libro no existe.

### Eliminar

```bash
curl -i -X DELETE "http://localhost:8081/api/libros/$LIBRO_ID"
curl -i "http://localhost:8081/api/libros/$LIBRO_ID"
```

DELETE devuelve HTTP 204; el GET posterior devuelve HTTP 404.

### Validación

```bash
curl -i -X POST http://localhost:8081/api/libros \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"","autor":"","anio":0}'
```

Devuelve HTTP 400. Título y autor son obligatorios y el año debe estar entre
1 y 9999. También se valida la paginación.

## Archivos y responsabilidades

| Archivo Java | Responsabilidad |
|---|---|
| CrudSolrApplication | Inicia Spring Boot y el escaneo automático |
| Libro | Mapea el documento con `@SolrEntity` y `@Field` |
| LibroRepository | CRUD y búsquedas derivadas |
| LibroRequest | Entrada JSON y validación |
| Pagina | Respuesta de paginación con estructura explícita |
| LibroService | Operaciones y manejo de documentos inexistentes |
| LibroController | Endpoints HTTP |

## Detalles de esta reimplementación

La firma real del artefacto 1.0.0 es:

```java
public interface LibroRepository extends SolrRepository<Libro> {
    Page<Libro> findByTituloContaining(String titulo, Pageable pageable);
    Page<Libro> findByAutor(String autor, Pageable pageable);
}
```

`SolrRepository` tiene un solo parámetro genérico; los IDs son siempre `String`.
El ejemplo de dos parámetros que aparece en el README del proyecto está
desactualizado respecto de las fuentes publicadas en Maven Central.

Los imports son:

```java
import com.tomaytotomato.data.solr.mapping.SolrEntity;
import com.tomaytotomato.data.solr.repository.SolrRepository;
import org.apache.solr.client.solrj.beans.Field;
```

El starter configura cliente, plantilla y repositorios. `save` añade o reemplaza
un documento con el mismo ID; el servicio comprueba existencia antes de un PUT.
No se necesita implementar los métodos básicos del repositorio.

| Propiedad Java | Campo Solr | Tipo |
|---|---|---|
| id | id | string, clave única |
| titulo | titulo_s | string |
| autor | autor_s | string |
| anio | anio_i | pint |

Los sufijos aprovechan campos dinámicos ya definidos en `_default` de Solr 10.0.0;
no se depende de que Solr infiera los tipos al recibir el primer documento.
La entidad tiene constructor público sin argumentos para la lectura del documento.

`spring.solr.commit-mode: immediate` provoca un hard commit tras cada escritura,
lo que facilita ver inmediatamente altas, cambios y bajas. Para cargas grandes
conviene planificar commits por lotes o autoCommit/autoSoftCommit del servidor.

Este ejemplo no incorpora control de concurrencia: comprobar existencia y guardar
son operaciones separadas. Escrituras concurrentes pueden sobrescribirse; para
un sistema que lo necesite se debe implementar control con `_version_`.

## Detener

Detén Spring Boot con Ctrl+C. Después:

```bash
docker compose down
```

Este comando conserva el volumen de datos.

## Verificación realizada

Se revisaron las firmas y configuración contra el JAR de fuentes 1.0.0 publicado,
el POM del mismo release y los campos dinámicos del esquema `_default` de Solr
10.0.0. Se validaron sintaxis XML/YAML y contenido del ZIP. No se ejecutaron
compilación ni pruebas HTTP: el entorno de preparación solo tiene Java 17,
sin Maven ni Docker. Los comandos anteriores permiten verificar el flujo completo.

## Fuentes

- Reimplementación: https://github.com/tomaytotomato/spring-data-solr
- Starter publicado: https://central.sonatype.com/artifact/com.tomaytotomato/solr-spring-boot-starter
- Metadata de versiones: https://repo.maven.apache.org/maven2/com/tomaytotomato/solr-spring-boot-starter/maven-metadata.xml
- POM 1.0.0: https://repo.maven.apache.org/maven2/com/tomaytotomato/spring-data-solr/1.0.0/spring-data-solr-1.0.0.pom
- Fuentes 1.0.0: https://repo.maven.apache.org/maven2/com/tomaytotomato/solr-spring-boot-autoconfigure/1.0.0/solr-spring-boot-autoconfigure-1.0.0-sources.jar
- Solr en Docker: https://solr.apache.org/guide/solr/latest/deployment-guide/solr-in-docker.html
- Esquema 10.0.0: https://github.com/apache/solr/blob/releases/solr/10.0.0/solr/server/solr/configsets/_default/conf/managed-schema.xml
