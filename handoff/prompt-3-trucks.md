# LarimarTruck — Prompt 3: módulo Trucks (listado + formulario)

Implementa el módulo **Trucks** sobre lo que ya existe en el proyecto. Este documento describe **solo** las dos pantallas nuevas: el listado de camiones y el formulario de alta/edición.

## Referencia de diseño (leer primero)

```
handoff/
  prompt-3-trucks.md                ← este documento
  design-reference/
    LarimarTruck.dc.html            ← prototipo actualizado: login, dashboard, Trucks y formulario
    support.js, image-slot.js       ← runtime del prototipo (NO usar en el proyecto)
    assets/
  assets/                           ← logos y placeholder
```

Antes de escribir código abre **`handoff/design-reference/LarimarTruck.dc.html`** en el navegador. Trae un panel de _Tweaks_ con la opción `startView`: ponla en **`trucks`** para ver el listado y en **`new truck`** para ver el formulario. También puedes navegar con el ítem **Trucks** del sidebar.

Cómo tratar la referencia:

- Es **referencia visual y de comportamiento, no código a copiar**. Extrae valores (colores, spacing, tipografías, breakpoints) y la lógica de interacción.
- **Lo que ya está construido en el proyecto manda en estructura y nombres**: layout admin, componentes, clases, rutas, controladores, modelos, tests y convenciones. Reutiliza y extiende; no dupliques.
- Si el layout admin del proyecto se desvió del prototipo (header, sidebar, paddings, componentes propios), **respeta el layout actual del proyecto** y monta estas dos pantallas dentro de él. De la referencia toma únicamente el diseño del **contenido**: la tabla de camiones y el formulario.
- No lleves `support.js` ni `image-slot.js` al proyecto.
- Si falta el prototipo, detente y pídelo.

## Recordatorio de identidad visual

`#1a4e57` principal · `#123238` hover/texto · `#4a909f` acento · `#F2F7F8` fondo app · `#FFFFFF` tarjetas · `#E0EBED` bordes · `#EFF5F6`/`#F4F8F9` separadores internos · `#5E7A80` texto secundario · `#7E9AA0` texto terciario. Bitter en títulos, Roboto en interfaz. Iconos Lucide. Interfaz en inglés. Esquinas 9–14px, sombras muy suaves.

---

## 1. Navegación

- El ítem **Trucks** del sidebar deja de mostrar el aviso de "pantalla no construida" y navega al listado.
- El título del header pasa a "Trucks" en ambas pantallas; el ítem del sidebar queda activo también dentro del formulario.
- Rutas sugeridas (adáptalas al patrón del proyecto): `trucks.index`, `trucks.create`, `trucks.store`, `trucks.edit`, `trucks.update`, `trucks.destroy`.

---

## 2. Pantalla: Fleet (listado de camiones)

### Cabecera de contenido

- Breadcrumb "Home / Trucks".
- Título **"Fleet"** en Bitter, 25px.
- A la derecha: botón secundario **"Export"** y botón primario **"New truck"** con icono `plus`, que lleva al formulario de creación.

### Tarjeta del listado

Tarjeta blanca, borde `#E0EBED`, radio 14px, `overflow:hidden`.

**Encabezado de la tarjeta** (borde inferior `#EFF5F6`):

- Título "Trucks" y subtítulo con métricas en vivo: `"{total} trucks · {disponibles} available · {en taller} in maintenance"`.
- A la derecha: **buscador** con icono `search`, placeholder "Plate, make, driver…", que filtra por placa, marca, modelo, chofer y tipo; y **pestañas de filtro por estado**: `All`, `Available`, `On trip`, `In maintenance`, `Out of service` (la activa con fondo blanco dentro de un contenedor `#F2F7F8`).

**Fila de encabezado de la tabla** (fondo `#F8FBFB`): etiquetas en mayúsculas, 10.5px, `letter-spacing` amplio, color `#5E7A80`.

**Columnas** (izquierda → derecha):

| Columna      | Contenido                                                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Image        | Miniatura 64×46, radio 9px, fondo `#EDF3F4`, borde `#E0EBED`. Foto del camión o placeholder.                                                  |
| Plate        | Placa en 13.5px/500 y, debajo, el **VIN** en 11px color `#7E9AA0`.                                                                            |
| Make & model | "Make Model" en 13.5px y, debajo, `"{año} · {odómetro con separador de miles} km"`.                                                           |
| Type         | Tipo de carrocería.                                                                                                                           |
| Capacity     | Capacidad en toneladas (`"30 t"`, o `—` si no hay dato).                                                                                      |
| Driver       | Chofer asignado, o "Unassigned".                                                                                                              |
| Status       | Chip de color con punto: Available verde, On trip azul, In maintenance ámbar, Out of service rojo.                                            |
| Actions      | Botón **lápiz** (editar → formulario precargado) y botón **papelera** (eliminar, con toast de confirmación "{placa} removed from the fleet"). |

- Filas con borde inferior `#F4F8F9` y hover `#F8FBFB`. Las filas no son clicleables: solo los botones de acción.
- **Estado vacío** cuando el filtro no devuelve nada: "No trucks match this filter.", centrado, 40px de padding.

**Pie de la tarjeta** (fondo `#F8FBFB`): a la izquierda `"Showing {n} of {total} trucks"`; a la derecha `"{n} with insurance or inspection expiring in 30 days"` (se calcula comparando las fechas de seguro e inspección con hoy + 30 días, en hora local).

### Responsive del listado

Tres niveles según el ancho **real disponible** (ancho de ventana menos el sidebar, expandido o colapsado):

- **≥1260px** — todas las columnas: `64px 130px minmax(0,1.25fr) 116px 92px minmax(0,1fr) 136px 76px`.
- **≥1000px** — se ocultan Type y Capacity: `64px 130px minmax(0,1.25fr) minmax(0,1fr) 136px 76px`.
- **<1000px** — se ocultan además Image y Driver: `118px minmax(0,1fr) 122px 70px`.

Importante: la plantilla de columnas debe declarar **solo las pistas realmente renderizadas** (no dejar pistas de 0px con celdas ocultas), y el encabezado y las filas deben compartir exactamente la misma plantilla.

---

## 3. Pantalla: formulario de camión

Página propia (no modal), con el mismo layout admin.

### Cabecera de contenido

- Breadcrumb "Home / Trucks / Back to fleet" (el último tramo es un enlace que vuelve al listado).
- Título: **"New truck"** en alta, o **"Edit {placa}"** en edición.
- A la derecha: botón secundario **"Cancel"** (vuelve al listado sin guardar) y botón primario **"Save truck"**.

### Estructura

Dos tarjetas en grid: formulario (1.7fr) y panel de foto (1fr). Por debajo de ~1080px de ancho disponible se apilan.

**Tarjeta "Truck details"** — encabezado con título y la nota "Fields marked with * are required.". El cuerpo se divide en grupos separados por línea `#EFF5F6`, con título de grupo en mayúsculas 10.5px color `#7E9AA0`. Campos en dos columnas (una sola por debajo de ~760px):

1. **IDENTIFICATION** — Plate*, VIN / chassis number, Make*, Model, Year, Status (select: Available, On trip, In maintenance, Out of service).
2. **SPECIFICATION** — Body type (select: Tractor unit, Rigid box, Flatbed, Chassis (container), Tanker, Dump), Capacity (tons), Odometer (km), Assigned driver (select del catálogo de choferes, con opción "— No driver —").
3. **COMPLIANCE** — Insurance expires (date), Inspection expires (date).
4. **Notes** — textarea a ancho completo, mínimo 96px de alto, placeholder "Maintenance history, restrictions, permits…".

Inputs: fondo `#F8FBFB`, borde `#DCE8EA`, radio 9px, padding 10px 12px, 13.5px; en foco borde `#4a909f` y fondo blanco. Labels 12.5px/500 color `#3D5F66`.

**Validación** (mensaje en bloque rojo `#FCEFEC` / borde `#F4DAD4` al pie del formulario, y también validación de servidor):

- Plate obligatoria → "Plate is required."
- Make obligatoria → "Make is required."
- Placa duplicada (ignorando el propio registro en edición) → "That plate already exists in the fleet."

La placa se normaliza a mayúsculas y sin espacios al guardar. Al guardar con éxito se vuelve al listado con toast: "{placa} added to the fleet" o "{placa} updated".

**Tarjeta "Photo"** — título "Photo", subtítulo "Shown on the trip board and dispatch lists.", zona de imagen de 168px de alto (radio 11px, fondo `#EDF3F4`) con carga de archivo y previsualización, y nota: "JPG or PNG, landscape, at least 640×480. A clear side view works best for dispatchers."

---

## 4. Modelo de datos

Entidad `Truck` con: `plate` (único, requerido), `make` (requerido), `model`, `year`, `type`, `capacity_tons`, `odometer_km`, `vin`, `driver_id` (nullable, FK al catálogo de choferes), `status` (enum de los cuatro estados), `insurance_expires_at` (date), `inspection_expires_at` (date), `notes` (text), `photo_path`.

- La foto del camión es la misma que se muestra en la miniatura del **Trip control board** del dashboard: una sola fuente de verdad.
- El select de choferes viene del catálogo de choferes, no de texto libre.
- Semillas de prueba: usa los 8 camiones de la referencia (AM-2021, AM-2044, AM-2058, AVR-3030, AVR-3041, TL-1185, TL-1190, TL-1202) con sus marcas, modelos, años, tipos, capacidades, odómetros, VIN, choferes, estados y fechas de vencimiento.
- Fechas y horas siempre en hora local.

## 5. Alcance

- No rediseñes login, layout ni el Trip control board: ya están implementados.
- El resto de las secciones del menú sigue sin diseñar; deja sus rutas como estén.
- Incluye tests siguiendo el patrón del proyecto: listado con filtros y búsqueda, creación válida, validación de placa requerida y duplicada, edición y borrado.
