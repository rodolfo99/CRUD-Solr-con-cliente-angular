# CRUD de Libros — Spring Boot + Apache Solr + Angular

> Aplicación **full stack en Java** para administrar y buscar libros con **Spring Boot**, **Apache Solr**, **Angular** y **Docker Compose**.

![Java](https://img.shields.io/badge/Java-21-informational)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-informational)
![Apache Solr](https://img.shields.io/badge/Apache%20Solr-10.0.0-informational)
![Angular](https://img.shields.io/badge/Angular-22.1.5-informational)
![Docker](https://img.shields.io/badge/Docker-Compose-informational)

Este repositorio muestra cómo construir un **CRUD REST con Spring Boot y Apache Solr**, acompañado de un cliente Angular. Además de las operaciones básicas sobre libros, el proyecto sirve como referencia para búsquedas por campos, paginación, persistencia documental e integración de Solr dentro de una arquitectura Java moderna.

## Lo más importante

- Backend REST con Spring Boot y Java 21.
- Persistencia y búsqueda mediante Apache Solr.
- Cliente Angular independiente.
- Crear, consultar, actualizar y eliminar libros.
- Búsqueda por título y autor.
- Paginación.
- Core `libros` creado automáticamente con Docker Compose.
- Ejemplo práctico de integración entre Java, Solr y Angular.

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

## Arquitectura

```text
Angular
   │ HTTP / REST
   ▼
Spring Boot
   │ integración Solr
   ▼
Apache Solr
```

## Estructura

```text
.
├── crud/             # Backend Spring Boot + Solr
└── cliente-angular/  # Frontend Angular
```

## Inicio rápido

### 1. Apache Solr

```bash
cd crud
docker compose up -d --wait
```

Solr queda disponible en:

```text
http://localhost:8984/solr/
```

El `compose.yaml` crea automáticamente el core `libros` y conserva los datos en un volumen Docker.

### 2. Backend Spring Boot

```bash
cd crud
mvn spring-boot:run
```

API principal:

```text
http://localhost:8081/api/libros
```

También puedes generar el JAR:

```bash
mvn clean package
java -jar target/crud-spring-data-solr-1.0.0.jar
```

### 3. Cliente Angular

```bash
cd cliente-angular
npm install
npm start
```

Abre:

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

Dentro de `crud/README.md` hay documentación técnica adicional sobre repositorios, campos Solr, paginación y pruebas con `curl`.

## Para qué sirve este proyecto

Puede utilizarse como base para estudiar o prototipar:

- **Apache Solr con Spring Boot**.
- Sistemas de búsqueda de catálogos.
- Indexación de documentos.
- APIs REST con búsqueda avanzada.
- Clientes Angular que consumen servicios Java.
- Aplicaciones donde la búsqueda sea tan importante como el CRUD.

## Otros proyectos del mismo perfil

- [CRUD PostgreSQL + Angular](https://github.com/rodolfo99/CRUD-PstgreSQL-Libros-con-cliente-angular)
- [CRUD Neo4j + Angular](https://github.com/rodolfo99/CRUD-LIBROS-NEO4J)
- [CRUD GraphQL + PostgreSQL + Angular](https://github.com/rodolfo99/crud-GraphQL-con-cliente-angular)
- [Spring Data GraphDB](https://github.com/rodolfo99/Spring-Data-GraphDB)
- [Marc2BF — MARC21 a BIBFRAME](https://github.com/rodolfo99/Marc2BF)

## Autor

**Rodolfo Valencia** — desarrollo de software, Java, Spring, Angular, bases de datos, tecnologías semánticas e inteligencia artificial.

GitHub: [@rodolfo99](https://github.com/rodolfo99)

## Temas relacionados

Spring Boot · Spring Data Solr · Apache Solr · SolrJ · Angular · Java · TypeScript · REST API · CRUD · búsqueda · Docker · Maven · full stack
