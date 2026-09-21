# LarimarTruck — Prompt 6: Catalogs (navieras, ciudades, puertos) + agendar viajes

Implementa lo siguiente sobre lo que ya existe. Este documento cubre **solo** lo nuevo desde el prompt 5:

1. **Settings → Catalogs**: catálogos de Shipping lines, Cities y Ports con edición inline.
2. **Schedule a trip**: página de formulario para crear (y editar) un viaje, que alimenta el Trip control board.
3. El botón **"New trip"** del dashboard, que hasta ahora no hacía nada, abre ese formulario.

No rediseñes login, layout admin, Trip control board, Trucks, Drivers ni Clients.

## Referencia de diseño (leer primero)

```
handoff/
  prompt-6-catalogs-trips.md        ← este documento
  design-reference/
    LarimarTruck.dc.html            ← prototipo actualizado (incluye Catalogs y Schedule a trip)
    support.js, image-slot.js       ← runtime del prototipo (NO usar en el proyecto)
    assets/
  assets/
```

Abre **`handoff/design-reference/LarimarTruck.dc.html`**. En _Tweaks_, `startView` abre directo `catalogs` y `schedule trip` (además de las pantallas anteriores).

Reglas de uso de la referencia: igual que en los prompts anteriores — referencia **visual y de comportamiento**, no código a copiar; **manda la estructura, nombres, componentes y convenciones del proyecto**; reutiliza tarjetas, chips de estado, botones de acción y patrones de formulario ya creados. No lleves `support.js` ni `image-slot.js` al proyecto.

Paleta, tipografías e idioma: los ya definidos. Montos en **RD$** con separador de miles.

---

## 1. Settings → Catalogs

Una sola pantalla con **tres pestañas**: `Shipping lines` · `Cities` · `Ports`. El ítem **Settings** del sidebar navega aquí. Breadcrumb "Home / Settings / Catalogs", título **"Catalogs"**.

**Decisión de producto importante:** ciudades y puertos son **dos catálogos independientes, sin relación entre sí**. Un viaje puede ir de cualquier origen a cualquier destino (puerto→ciudad, ciudad→puerto, ciudad→ciudad, puerto→puerto). No implementes validaciones que aten el origen o el destino a un tipo de lugar.

**Cabecera:** a la derecha, un botón primario que cambia de texto según la pestaña: "Add shipping line" / "Add city" / "Add port". Añade una **fila nueva en blanco en modo edición** al final de la tabla (no abre otra página).

**Tarjeta:** título y subtítulo por pestaña:

- Shipping lines — "Carriers you book containers with. Used in the trip board and trip forms."
- Cities — "Pickup and delivery points inland. Distance is measured from your Santiago base."
- Ports — "Sea terminals you load from and deliver to. Independent from the city list."

**Columnas por pestaña** (3 campos editables + Usage + Status + Actions):

| Pestaña        | Campo 1       | Campo 2  | Campo 3                    |
| -------------- | ------------- | -------- | -------------------------- |
| Shipping lines | Line (nombre) | SCAC     | Contact (teléfono · email) |
| Cities         | City          | Province | Km from base               |
| Ports          | Port          | Code     | Km from base               |

- **Usage**: cantidad de viajes que usan el registro (`"4 trips"`, `"—"` si ninguno), alineado a la derecha.
- **Status**: chip Active/Inactive **clicleable** que alterna el estado. Los inactivos dejan de aparecer en los selects del formulario de viaje, pero siguen visibles en el historial.
- **Actions**: lápiz (editar) y papelera. **Borrado protegido**: si Usage > 0 la papelera se muestra deshabilitada (icono `#B9C9CC`, borde `#EDF3F4`) y al pulsarla aparece el toast "{nombre} is used on N trips — set it inactive instead".

**Edición inline:** el lápiz convierte los campos de la fila en inputs (borde `#4a909f`, fondo blanco, 12.5px); las acciones pasan a **check** (guardar, fondo `#1a4e57`) y **x** (cancelar). La fila en edición se resalta con fondo `#F8FBFB`. Validación: el nombre es obligatorio ("{Columna} name is required.") y no puede repetirse en la misma lista ("“{nombre}” is already on this list."), mostrada en bloque rojo dentro de la tarjeta. Toasts: "{nombre} added to {catálogo}" / "{nombre} updated" / "{nombre} deleted".

**Pie:** a la izquierda `"{n} records · {n} active"`; a la derecha "Records used on a trip can't be deleted — set them inactive instead.".

**Responsive** (ancho disponible = ventana − sidebar), pistas = celdas renderizadas:

- **≥1180px:** `minmax(0,1.3fr) 110px minmax(0,1.1fr) 88px 112px 96px`.
- **≥900px:** se oculta el campo 3 → `minmax(0,1.3fr) 110px 88px 112px 96px`.
- **<900px:** se ocultan campo 2, campo 3 y Usage → `minmax(0,1fr) 112px 96px`.

**Semillas:** navieras Maersk (MAEU), CMA CGM (CMDU), MSC (MSCU), Hapag-Lloyd (HLCU), Evergreen (EGLV) y Seaboard Marine (inactiva); ciudades Santiago (0 km), Moca (34), La Vega (75), Puerto Plata (84), Bonao (112), Santo Domingo (155) y San Francisco de Macorís (inactiva); puertos Caucedo (DOCAU, 214), Río Haina (DOHAI, 196), Puerto Plata (DOPOP, 84) y Manzanillo (DOMAN, inactivo).

---

## 2. Schedule a trip (formulario de viaje)

Página propia con la misma estructura de los otros formularios: tarjeta de campos (1.7fr) + tarjeta de resumen (1fr), apiladas por debajo de ~1080px; campos en dos columnas, una sola por debajo de ~760px.

**Reglas del modelo acordadas:** un viaje = **un contenedor**; se agenda **uno por uno** (sin alta en lote); **solo fecha** del viaje (sin horas ni citas); el viaje lleva **tarifa al cliente y costos**.

**Cabecera:** breadcrumb "Home / Dashboard / Schedule a trip" (Dashboard enlaza al board), título **"Schedule a trip"** (o "Edit trip"), botones **Cancel** y **Schedule trip**.

**Tarjeta "Trip details"**, nota "One trip carries one container. Fields marked with * are required.". Grupos separados por línea:

1. **ORDER** — arriba, un par de botones grandes **Import** ("Port → City") / **Export** ("City → Port") con icono de camión (espejado en Export); el seleccionado con fondo `#E3F1F3`, borde `#4a909f` y texto `#1a4e57`. Esta selección **solo decide en qué columna del board aparece el viaje**, no restringe el origen ni el destino. Debajo: Order number (autogenerado tipo `TRP-1042`, editable), Trip date* (por defecto hoy), Client* (select de clientes activos), Shipping line* (select de navieras activas).
2. **ROUTE** — Origin* y Destination*: un mismo select con dos grupos, **Ports** y **Cities**, poblados de los catálogos activos (usa `<optgroup>` o su equivalente en el proyecto). Distance (km): se precarga con la distancia del catálogo del punto más lejano y queda editable. Status (select con los seis estados del board; por defecto Scheduled).
3. **CONTAINER** — Container number, Size (20' / 40' / 40' HC), Cargo type (Dry / Reefer / Hazardous), Weight (tons).
4. **ASSIGNMENT** — Truck y Driver, ambos **opcionales**, con nota "You can leave both empty and assign them later from the trip board.".
5. **RATE & COSTS (RD$)** — Rate charged to client, Fuel, Tolls, Driver pay.

**Validación** (bloque rojo al pie + validación de servidor), en este orden: "Pick the trip date." · "Select the client." · "Select the shipping line." · "Select origin and destination." · "Origin and destination can't be the same place.".

**Al guardar:** el viaje se crea y la app vuelve al **Trip control board**, posicionado en el día del viaje (si es hoy o mañana), con toast "Trip scheduled — {cliente} added to the board", o "Trip scheduled for {fecha}" si la fecha cae fuera del rango visible del board.

**Tarjeta "Summary"** (columna derecha, se actualiza en vivo mientras se llena el formulario): subtítulo "How this trip will show on the board."

- Tile con icono de camión (`#1a4e57` en import, `#4a909f` y espejado en export), la línea "Import · Port → City" / "Export · City → Port" y debajo la fecha en formato "Today, Friday Sep 12" / "Tomorrow, …" / "{día} {Mmm} {D}", o "No date selected".
- Bloque `#F8FBFB` con la ruta `Origin → Destination` (placeholders "Origin"/"Destination" si falta) y, debajo, `"{km} km · {tamaño} {tipo de carga}"`.
- Lista Client / Line / Container / Crew con valores o "Not selected", "Not entered", "Not assigned".
- Bloque de dinero: **Rate**, **Costs** (suma de combustible + peajes + pago al chofer) y **Margin** destacado en Bitter 21px con su porcentaje sobre la tarifa; en rojo `#B14C3C` si es negativo, verde `#1F5C3D` si es positivo.

**Botón "New trip" del dashboard:** abre este formulario con la fecha de hoy y un número de orden sugerido.

---

## 3. Datos

**Catálogos** — tres entidades independientes: `ShippingLine` (`name`* único, `scac`, `contact`, `active`), `City` (`name`* único, `province`, `km_from_base`, `active`), `Port` (`name`* único, `code`, `km_from_base`, `active`). Ninguna relación entre City y Port. Borrado bloqueado cuando existen viajes asociados (o borrado lógico vía `active`).

**Trip** — amplía la entidad de viaje ya existente con: `order_number`, `direction` (import/export), `trip_date` (date), `client_id`, `shipping_line_id`, `origin` y `destination` (referencia polimórfica a City **o** Port, sin restricción de combinación), `distance_km`, `status` (los seis estados del board), `container_number`, `container_size` (20'/40'/40' HC), `cargo_type` (Dry/Reefer/Hazardous), `weight_tons`, `truck_id` (nullable), `driver_id` (nullable), `rate`, `fuel_cost`, `toll_cost`, `driver_pay`.

- El **margen** (tarifa − costos) se calcula, no se almacena.
- `distance_km` se precarga del catálogo pero queda editable por viaje: es la que alimenta los km del historial en los perfiles de camión, chofer y cliente.
- Los selects de cliente, naviera, ciudad, puerto, camión y chofer salen de sus catálogos; solo se ofrecen los registros activos.
- Fechas en hora local.

## 4. Alcance y tests

- Solo lo descrito aquí. Con esto se cierra el MVP de operaciones; Orders, Invoices y Reports siguen sin diseñar.
- Tests: catálogos (crear, renombrar, nombre duplicado, alternar activo, borrado bloqueado cuando hay viajes); viaje (creación válida, las cinco validaciones, que aparezca en el board en el día correcto, que camión y chofer puedan quedar vacíos, y que el margen se calcule bien).
