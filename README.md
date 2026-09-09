# CRUD de Libros con Spring Boot, Apache Solr y Angular

Proyecto full stack de ejemplo para administrar y buscar libros usando **Spring Boot**, **Apache Solr** y un cliente web desarrollado con **Angular**.

El backend implementa un CRUD REST sobre Solr mediante una reimplementación comunitaria de Spring Data Solr, mientras que el frontend Angular permite gestionar el catálogo desde el navegador.

## Tecnologías

- Java 21
- Spring Boot 4.0.6
- Spring Web MVC
- `com.tomaytotomato:solr-spring-boot-starter:1.0.0`
- Apache Solr 10.0.0
- Maven
- Docker Compose
- Angular 22.1.5
- TypeScript 6.0
- RxJS

## Estructura del repositorio

```text
.
├── crud/             # Backend Spring Boot + Solr
└── cliente-angular/  # Frontend Angular
```

## Backend

La API REST administra documentos de libros almacenados en un core de Solr llamado `libros`.

Endpoint principal:

```text
http://localhost:8081/api/libros
```

Solr queda disponible en:

```text
http://localhost:8984/solr/
```

### Ejecutar Solr con Docker

```bash
cd crud
docker compose up -d --wait
```

El `compose.yaml` incluido crea automáticamente el core `libros` y conserva los datos en un volumen Docker.

### Ejecutar Spring Boot

```bash
cd crud
mvn spring-boot:run
```

Para generar y ejecutar el JAR:

```bash
mvn clean package
java -jar target/crud-spring-data-solr-1.0.0.jar
```

## Cliente Angular

```bash
cd cliente-angular
npm install
npm start
```

Después abre:

```text
http://localhost:4200
```

## Funcionalidades

- Crear libros
- Listar libros
- Consultar un libro por ID
- Actualizar libros
- Eliminar libros
- Buscar por título
- Buscar por autor
- Paginación
- Persistencia en Apache Solr
- Cliente web Angular

## Sobre Spring Data Solr

Este proyecto utiliza `solr-spring-boot-starter` de `com.tomaytotomato`, una reimplementación comunitaria del soporte estilo Spring Data para Solr. No corresponde al antiguo módulo oficial archivado `org.springframework.data:spring-data-solr`.

Dentro de `crud/README.md` hay documentación técnica más detallada sobre repositorios, campos Solr, paginación y pruebas con `curl`.

## Objetivo del proyecto

Mostrar cómo construir un **CRUD con Spring Boot, Apache Solr y Angular**, incluyendo búsquedas, persistencia documental, Docker Compose y una interfaz web separada del backend.

## Temas relacionados

Spring Boot, Spring Data Solr, Apache Solr, SolrJ, Angular, Java, TypeScript, REST API, CRUD, búsqueda, Docker, Maven, full stack.
