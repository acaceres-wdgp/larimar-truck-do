# LarimarTruck — Prompt 4: módulo Drivers + perfiles de camión y chofer

Implementa lo siguiente sobre lo que ya existe. Este documento cubre **solo** lo nuevo desde el prompt 3:

1. Módulo **Drivers**: listado (grid) y formulario de alta/edición.
2. **Perfil de camión** (vista de detalle con historial de viajes).
3. **Perfil de chofer** (vista de detalle con historial de viajes).
4. Un cambio pequeño en el grid de **Trucks** ya implementado: nuevo icono de **ver** en Actions.

No rediseñes login, layout admin, Trip control board ni el formulario de camiones: solo se añade lo descrito aquí.

## Referencia de diseño (leer primero)

```
handoff/
  prompt-4-drivers-profiles.md      ← este documento
  design-reference/
    LarimarTruck.dc.html            ← prototipo actualizado (incluye Drivers y ambos perfiles)
    support.js, image-slot.js       ← runtime del prototipo (NO usar en el proyecto)
    assets/
  assets/
```

Abre **`handoff/design-reference/LarimarTruck.dc.html`** en el navegador. En el panel de _Tweaks_, `startView` abre directo cada pantalla: `drivers`, `new driver`, `driver profile`, `truck profile` (además de `login`, `dashboard`, `trucks`, `new truck`).

Reglas de uso de la referencia (iguales que antes): es referencia **visual y de comportamiento**, no código a copiar; **manda la estructura, nombres y convenciones del proyecto**; reutiliza los componentes, layouts, helpers y patrones de test ya existentes; el layout admin del proyecto se respeta tal como está. No lleves `support.js` ni `image-slot.js` al proyecto.

Paleta y tipografías: las mismas del prompt 2/3 (`#1a4e57`, `#123238`, `#4a909f`, `#F2F7F8`, `#FFFFFF`, `#E0EBED`, `#EFF5F6`, `#F4F8F9`, `#5E7A80`, `#7E9AA0`; Bitter en títulos, Roboto en interfaz, iconos Lucide, interfaz en inglés).

---

## 1. Cambio en el grid de Trucks (ya implementado)

- En la columna **Actions**, antes del lápiz, añade un botón con icono `eye` y tooltip "View profile" que lleva al **perfil del camión**.
- Orden de los botones: **ver · editar · eliminar**. La columna Actions pasa a ~104px (100px en el nivel angosto) para que quepan los tres.
- Mismo botón `eye` en el grid de Drivers.

---

## 2. Pantalla: Drivers (grid)

Mismo patrón visual que el grid de camiones.

### Cabecera de contenido

- Breadcrumb "Home / Drivers", título **"Drivers"** (Bitter 25px).
- Botones: **"Export"** (secundario) y **"New driver"** (primario, icono `plus`) → formulario de creación.

### Tarjeta del listado

- Encabezado: título "Crew" y subtítulo `"{total} drivers · {disponibles} available · {en ruta} on the road"`.
- A la derecha: buscador con icono `search`, placeholder "Name, phone, license…" (filtra por nombre, apellido, teléfono, licencia y camión) y pestañas de estado: `All`, `Available`, `On trip`, `On leave`, `Inactive`.

**Columnas:**

| Columna | Contenido                                                                                                                                             |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Photo   | Avatar circular 44px. Si no hay foto, **iniciales** del chofer sobre fondo `#E3F1F3` en color `#1a4e57`. La foto, cuando existe, cubre las iniciales. |
| Name    | Nombre completo en 13.5px/500 y, debajo, la cédula (en el nivel intermedio se añade `· {camión}`).                                                    |
| Phone   | Teléfono, o `—`.                                                                                                                                      |
| License | Número de licencia y, debajo, `"Expires {Mmm D, YYYY}"`; ese texto va en rojo `#B14C3C` si vence en menos de 60 días, si no en `#7E9AA0`.             |
| Truck   | Camión asignado, o "Unassigned".                                                                                                                      |
| Status  | Chip de color: Available verde, On trip azul, On leave ámbar, Inactive rojo.                                                                          |
| Actions | Ver (`eye`) → perfil · Editar (`pencil`) → formulario precargado · Eliminar (`trash-2`) con toast "{nombre} removed from the crew".                   |

- Estado vacío: "No drivers match this filter."
- Pie: `"Showing {n} of {total} drivers"` y, a la derecha, `"{n} with a license expiring in 60 days"`.

### Responsive (ancho disponible = ventana − sidebar)

- **≥1260px:** `44px minmax(0,1.2fr) 150px 158px 104px 132px 104px`.
- **≥1000px:** se oculta Truck → `44px minmax(0,1.2fr) 150px minmax(0,1fr) 132px 104px`.
- **<1000px:** se ocultan Photo, Phone y License → `minmax(0,1fr) 124px 100px`.

La plantilla de columnas debe declarar **solo las pistas realmente renderizadas**, y encabezado y filas comparten la misma plantilla.

---

## 3. Pantalla: formulario de chofer

Página propia, misma estructura que el formulario de camiones: tarjeta de campos (1.7fr) + tarjeta de foto (1fr); se apilan por debajo de ~1080px. Campos en dos columnas, una sola por debajo de ~760px.

- Cabecera: breadcrumb "Home / Drivers / Back to crew" (enlace al listado), título **"New driver"** o **"Edit {nombre} {apellido}"**, botones **Cancel** y **Save driver**.
- Tarjeta "Driver details", nota "Fields marked with * are required.", grupos separados por línea:
    1. **IDENTITY** — Name*, Last name*, National ID (cédula), Status (select con los cuatro estados).
    2. **CONTACT** — Phone, Emergency contact.
    3. **LICENSE & ASSIGNMENT** — Driver license*, License category (select: Category 04 (heavy), Category 05 (articulated), Category 03 (light truck), Hazmat endorsement), License expires (date), Assigned truck (select del catálogo de camiones con opción "— No truck —").
    4. **Notes** — textarea a ancho completo, placeholder "Routes he knows, certifications, restrictions…".
- Estilos de inputs y labels idénticos al formulario de camiones.
- **Validación** (bloque rojo al pie + validación de servidor): "Name is required.", "Last name is required.", "Driver license is required.", y licencia duplicada → "That license number is already registered.". La licencia se normaliza a mayúsculas. Al guardar: vuelve al listado con toast "{nombre} added to the crew" / "{nombre} updated".
- Tarjeta "Photo": subtítulo "Used in dispatch lists and trip assignments.", zona circular de 168px con carga y previsualización, nota "Square headshot, at least 400×400. If there is no photo we show the driver's initials.".

---

## 4. Pantalla: perfil de camión

Ruta tipo `trucks.show`. Dos columnas: ficha (≈0.85fr) e historial (≈1.6fr); se apilan por debajo de ~1080px de ancho disponible.

**Cabecera:** breadcrumb "Home / Trucks / {placa}" (Trucks enlaza al listado), título **"{placa} · {marca} {modelo}"**, botón secundario **"Back to fleet"** y botón primario **"Edit truck"** (icono `pencil`) que abre el formulario de edición de ese camión.

**Tarjeta de ficha:** imagen del camión a 200px de alto arriba (placeholder si no hay foto), debajo el chip de estado y una grilla de dos columnas con: Plate, VIN / chassis, Make & model, Year, Body type, Capacity, Odometer, Assigned driver, Insurance expires, Inspection expires y **Notes a ancho completo** (o "No notes on file."). Etiquetas en mayúsculas 10.5px color `#7E9AA0`, valores 13.5px color `#123238`.

**Métricas (4 tarjetas):** Trips on record, Completed, Distance (suma de km), Last trip (fecha del viaje más reciente). Valor en Bitter 21px. En anchos pequeños se muestran en 2×2.

**Historial de viajes:** tarjeta con título "Trip history" y subtítulo "Most recent first · {n} trips on record". Columnas: **Date** (fecha + etiqueta Import/Export, Import en `#1a4e57`, Export en `#4a909f`), **Client & route** (cliente arriba, `From → To` debajo), **Driver**, **Line** (naviera), **Km** (alineado a la derecha, tabular) y **Status** (chip con los colores de estado de viaje del dashboard). Vacío: "No trips recorded for this truck yet.".

Responsive del historial (mismo criterio de pistas = celdas):

- **≥1240px:** `104px minmax(0,1.4fr) 140px 108px 84px 132px`.
- **≥940px:** se ocultan Line y Km → `104px minmax(0,1.4fr) 140px 132px`.
- **<940px:** se oculta además Driver → `96px minmax(0,1fr) 124px`.

---

## 5. Pantalla: perfil de chofer

Ruta tipo `drivers.show`. Misma estructura de dos columnas y las mismas métricas e historial.

**Cabecera:** breadcrumb "Home / Drivers / {nombre}", título con el nombre completo, botones **"Back to crew"** y **"Edit driver"**.

**Tarjeta de ficha:** avatar circular de 132px centrado (iniciales en Bitter 38px si no hay foto), nombre en Bitter 18px, chip de estado, y grilla de dos columnas con: National ID, Phone, Driver license, Category, License expires, Assigned truck, **Emergency contact** y **Notes** a ancho completo.

**Historial:** idéntico al del camión, pero la columna intermedia es **Truck** en lugar de Driver. Vacío: "No trips recorded for this driver yet.".

---

## 6. Datos

Entidad `Driver`: `first_name`_, `last_name`_, `national_id`, `phone`, `emergency_contact`, `license_number`* (único), `license_category`, `license_expires_at` (date), `truck_id` (nullable), `status` (enum: Available, On trip, On leave, Inactive), `notes`, `photo_path`.

- La relación camión ↔ chofer es una sola fuente de verdad: el chofer asignado que se ve en el perfil/grid de camiones y el camión asignado del chofer son la misma asociación.
- El **historial de viajes** sale de los viajes ya registrados (los del Trip control board), filtrados por camión o por chofer y ordenados por fecha descendente. Campos que necesita: fecha, tipo (import/export), cliente, naviera, origen, destino, camión, chofer, estado y kilómetros del viaje. Si el modelo de viaje aún no tiene `km`, agrégalo.
- Métricas calculadas, no almacenadas.
- Fechas siempre en hora local.
- Semillas: usa los 8 choferes de la referencia (Armando Peña, Luis Guzmán, Ramón Díaz, José Mercedes, Pedro Almonte, Miguel Santos, Félix Rosario, Carlos Bonilla) con sus teléfonos, licencias, categorías, vencimientos, camiones y estados, y un historial de viajes de las últimas semanas como el del prototipo.

## 7. Alcance y tests

- Solo lo descrito aquí. El resto de las secciones del menú sigue sin diseñar.
- Tests siguiendo el patrón del proyecto: listado de choferes con filtros y búsqueda; creación válida; validaciones de nombre, apellido, licencia requerida y licencia duplicada; edición; borrado; y que cada perfil cargue la ficha y solo los viajes de ese camión/chofer.
