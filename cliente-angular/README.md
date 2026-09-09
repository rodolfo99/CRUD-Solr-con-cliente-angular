# Cliente Angular para Spring Data Solr

Aplicación Angular 22.1.5, standalone, con signals, formularios reactivos y
HttpClient. Consume el CRUD de libros del proyecto `crud-spring-data-solr`
entregado anteriormente. Los datos se guardan en ese backend.

## Requisitos

- Node.js 24.15.0 o posterior de la rama 24.x (también admite las ramas indicadas en `package.json`).
- npm, incluido con Node.js.
- El backend anterior en `http://127.0.0.1:8081` con Solr iniciado.

No necesitas instalar Angular CLI globalmente. El proyecto incluye su propia
versión y un `package-lock.json` para instalar las dependencias exactas.

## 1. Iniciar el backend anterior

En la carpeta `crud-spring-data-solr`:

```bash
docker compose up -d --wait
mvn spring-boot:run
```

Mantén esa terminal abierta. Puedes comprobarlo con:

```bash
curl 'http://localhost:8081/api/libros?pagina=0&tamanio=10'
```

## 2. Iniciar Angular

Descomprime el ZIP, abre otra terminal y entra en `cliente-angular-solr`:

```bash
npm ci
npm start
```

Abre http://localhost:4200 en el navegador.

El proxy de desarrollo redirige `/api/**` a `http://127.0.0.1:8081`. No es necesario
agregar `@CrossOrigin` ni cambiar el backend para este uso local. Las peticiones
las envía Angular a su propio origen y el servidor de desarrollo las reenvía a Spring.

Si el backend usa otro puerto, cambia `target` en `proxy.conf.json` y reinicia
`npm start`. El backend y Angular deben ejecutarse en la misma máquina para usar
el destino `127.0.0.1` tal como está configurado.

## Funciones

- Listado paginado con tamaños 10, 20, 50 y 100.
- Búsqueda por parte del título o por nombre exacto del autor, con un filtro por vez.
- Alta de libros con UUID generado por el backend.
- Lectura del documento actual antes de abrir la edición.
- Actualización mediante PUT y eliminación con confirmación.
- Validación de título, autor y año entero entre 1 y 9999.
- Estados de carga, catálogo vacío, errores y operaciones confirmadas.
- Protección contra doble envío del formulario.
- Recuperación de página válida al borrar el último elemento de una página.
- Diseño adaptable a pantallas pequeñas y diálogos nativos con navegación por teclado.

Las búsquedas distinguen mayúsculas y acentos, como los campos `*_s` del backend.
El listado conserva el orden por ID del servidor. Un libro recién creado puede
aparecer en una página posterior; la notificación confirma el alta y puedes
buscarlo por su título. Si una escritura falla por desconexión, comprueba el
catálogo antes de repetirla: el servidor pudo haberla recibido.

## Contrato HTTP

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/libros?pagina=0&tamanio=10` | Listado |
| GET | `/api/libros?pagina=0&tamanio=10&titulo=Spring` | Buscar por título |
| GET | `/api/libros?pagina=0&tamanio=10&autor=Craig%20Walls` | Buscar por autor |
| GET | `/api/libros/{id}` | Obtener libro |
| POST | `/api/libros` | Crear |
| PUT | `/api/libros/{id}` | Actualizar |
| DELETE | `/api/libros/{id}` | Eliminar |

JSON de alta/actualización:

```json
{"titulo":"Spring en acción","autor":"Craig Walls","anio":2022}
```

Respuesta de un libro:

```json
{"id":"uuid-del-servidor","titulo":"Spring en acción","autor":"Craig Walls","anio":2022}
```

Respuesta paginada:

```json
{
  "contenido": [],
  "pagina": 0,
  "tamanio": 10,
  "totalElementos": 0,
  "totalPaginas": 0
}
```

## Archivos principales

| Archivo | Contenido |
|---|---|
| `src/app/libro.model.ts` | Tipos de libro, entrada y página |
| `src/app/libros.service.ts` | Solicitudes al backend |
| `src/app/app.component.ts` | Estado, formularios y operaciones |
| `src/app/app.component.html` | Tabla, búsquedas y diálogos |
| `src/styles.css` | Estilos adaptables |
| `proxy.conf.json` | Destino de la API en desarrollo |
| `src/app/app.component.spec.ts` | Pruebas de flujos y contrato HTTP |

## Compilar y probar

```bash
npm run build
npm test
```

La compilación genera `dist/cliente-angular-solr/browser/`.

El proxy de `ng serve` se aplica únicamente en desarrollo. Al publicar el build,
configura el servidor web para reenviar `/api/` al backend y servir Angular en el
mismo origen. No abras `index.html` directamente con `file://`.

## Verificación de esta entrega

- Compilación de producción ejecutada correctamente.
- Seis pruebas automatizadas de flujos y contrato HTTP, con backend simulado:
  validación, filtrado/paginación, conservación del formulario ante fallo,
  bloqueo de envíos duplicados, edición con ID y recuperación de página al borrar.
- No se ejecutó una prueba integral contra Spring/Solr ni una revisión visual en
  navegador. El proyecto del backend es una entrega separada y debe estar iniciado
  para usar este cliente.

## Documentación consultada

- Compatibilidad de Angular: https://angular.dev/reference/versions
- Proxy del servidor de desarrollo: https://angular.dev/tools/cli/serve
