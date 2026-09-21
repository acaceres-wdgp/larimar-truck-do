# LarimarTruck — Prompt 2: Login, layout admin y widget del dashboard

Implementa las siguientes pantallas sobre la base ya creada.

## Referencia de diseño (leer primero)

Todo el material de diseño está en la carpeta **`handoff/`** de este repositorio:

```
handoff/
  prompt-2-larimartruck.md          ← este documento
  design-reference/
    LarimarTruck.dc.html            ← prototipo del login y el dashboard
    support.js, image-slot.js       ← runtime del prototipo (NO usar en el proyecto)
    assets/                         ← logos y placeholder
  assets/                           ← los mismos logos, sueltos
  LEEME.md
```

Antes de escribir código, lee **`handoff/design-reference/LarimarTruck.dc.html`**. Es un prototipo HTML autónomo, ya funcionando, del login y del dashboard descritos aquí: contiene los valores exactos de colores, spacing, tamaños de tipografía, iconos y breakpoints, más la lógica de las interacciones.

Cómo tratarlo:

- Es una **referencia visual, no código a copiar**. Extrae de él los valores de diseño y el comportamiento; la implementación debe seguir la arquitectura, convenciones y componentes que ya existen en este proyecto.
- **Reutiliza lo que ya está construido** — layouts, componentes Blade, clases utilitarias, configuración de Tailwind, helpers, modelos, patrón de rutas y controladores, estructura de tests. Si un elemento del diseño (botón, tarjeta, input, badge, dropdown, tabla) ya tiene un componente en el proyecto, úsalo y extiéndelo en vez de crear uno nuevo; si no existe, créalo siguiendo el patrón de los existentes.
- Si el diseño y las convenciones del proyecto chocan, **gana el proyecto** en estructura y nombres, y el diseño en apariencia y comportamiento.
- No lleves `support.js` ni `image-slot.js` al proyecto: son solo el runtime del prototipo.
- Copia los logos y el placeholder de `handoff/assets/` a la carpeta pública de imágenes del proyecto (`public/images/` o la que ya se use): `logo-larimar.png`, `logo-larimar-white.png`, `mark-larimar.png`, `mark-larimar-white.png`, `truck-placeholder.png`.
- Si `handoff/design-reference/LarimarTruck.dc.html` no existe, detente y pídelo antes de continuar. Este documento describe todos los requerimientos, pero sin el prototipo tendrías que decidir los detalles visuales por tu cuenta.

## Identidad visual

- **Producto:** LarimarTruck, de Larimar.dev.
- **Paleta:** `#1a4e57` (principal: sidebar, botones primarios), `#123238` (hover/texto), `#4a909f` (acento, iconos), `#94d5dd` y `#b9f7fc` (acentos sobre fondo oscuro), `#a4dcde` (texto secundario sobre oscuro), `#F2F7F8` (fondo de app), `#FFFFFF` (tarjetas), `#E0EBED` (bordes), `#5E7A80` (texto secundario).
- **Tipografías:** Bitter (títulos y encabezados), Roboto (interfaz y texto).
- **Iconografía:** Lucide, trazo de 1.5px.
- **Logo:** `assets/logo-larimar.png`, más variantes en blanco y versión recortada de la marca (`mark-larimar*.png`) para el sidebar.
- **Idioma de la interfaz:** inglés.
- **Estilo:** SaaS limpio y espacioso, modo claro, esquinas redondeadas (9–14px), sombras muy suaves.

---

## 1. Login

Pantalla partida en dos mitades.

**Mitad izquierda (panel de marca, fondo `#1a4e57`):**

- Logo de Larimar.dev en blanco, arriba.
- Etiqueta "Fleet operations" en pill con borde.
- Titular grande en Bitter y un párrafo de apoyo.
- Tres métricas al pie (valor + etiqueta).
- Formas geométricas decorativas (círculos y un cuadrado rotado) en tonos de la paleta.

**Mitad derecha (formulario, fondo `#F2F7F8`):**

- Marca LarimarTruck (icono + nombre).
- Título "Welcome back" y subtítulo.
- Tarjeta blanca con: campo Email, campo Password (con enlace "Forgot?" alineado a la derecha de su etiqueta), checkbox "Keep me signed in", botón primario "Sign in" a ancho completo.
- Mensaje de error en la tarjeta cuando la validación falla (ej. email vacío).
- Pie: "No account yet? Start a 14-day trial".

**Responsive:** por debajo de ~980px el panel de marca se oculta y el formulario ocupa todo el ancho.

---

## 2. Layout de administración

Tres zonas: sidebar, header y content area.

### Sidebar (fondo `#1a4e57`, 248px)

- Arriba: icono de la marca + "LarimarTruck" y, debajo, "BY LARIMAR.DEV" en mayúsculas pequeñas.
- Menú con icono Lucide + etiqueta, en este orden: Dashboard (`layout-dashboard`), Operations (`route`), Orders (`clipboard-list`), Clients (`building-2`), Trucks (`truck`), Drivers (`users`), Invoices (`receipt`), Reports (`trending-up`), Settings (`settings`).
- Ítem activo: fondo translúcido claro, barra vertical de acento a la izquierda, texto blanco e icono en `#b9f7fc`.
- Al pie: tarjeta de estado de suscripción ("Trial · N days left", límite del plan, botón "Upgrade plan") y, debajo, un control "Collapse menu" con chevron.
- **Colapsado (68px):** solo iconos, cada uno dentro de un tile redondeado; el activo con tile en color de acento. Tooltip con el nombre al pasar el cursor. La tarjeta de suscripción se oculta.
- La tarjeta de suscripción también se oculta en pantallas de poca altura (<720px) para que el menú no se corte.

### Header (sticky, fondo blanco translúcido con blur, borde inferior)

De izquierda a derecha:

- Botón de menú hamburguesa (solo en móvil).
- Título de la sección activa (Bitter) y, debajo, la fecha completa ("Thursday, September 11, 2026").
- Buscador con icono: placeholder "Search orders, trucks, clients…".
- A la derecha: hora actual + fecha corta (se actualiza sola), botón de notificaciones con campana y punto indicador, y chip de usuario (iniciales en círculo + nombre + chevron).
- El chip de usuario abre un menú con el nombre y correo completos, y las opciones Profile, Company settings y Sign out (esta última devuelve al login).

### Content area

- Breadcrumb ("Home / Dashboard").
- Saludo según la hora: "Good morning / afternoon / evening, {nombre}".
- Botones de acción a la derecha: "Export" (secundario) y "New trip" (primario).
- Debajo, los widgets del dashboard.

### Responsive del layout

- **≥900px:** sidebar fijo visible (expandido o colapsado según la preferencia del usuario).
- **<900px:** sidebar se convierte en drawer deslizante sobre un fondo oscurecido; se abre con la hamburguesa y se cierra al pulsar fuera o al elegir una sección.
- El buscador, el reloj y el nombre del usuario se ocultan progresivamente al reducir el ancho.

---

## 3. Widget del dashboard: Trip control board

Tablero de control de los viajes de un día. Es una tarjeta blanca con encabezado, dos columnas de contenido y un pie.

### Encabezado del widget

- Título "Trip control board".
- Subtítulo con la fecha en curso, el total de viajes y cuántos van sin camión: "Today, September 11 · 11 trips · 4 without truck".
- **Filtro de fecha** a la derecha: tres pestañas — **Today**, **Tomorrow**, **Pick date**. Al elegir "Pick date" aparece un selector de fecha y el tablero carga los viajes de ese día.

### Dos columnas

Columna izquierda **Imports** y columna derecha **Exports**, con un divisor vertical entre ellas.

- **Import** = contenedor que sale de un muelle hacia una ciudad. Encabezado: tile con icono de camión en `#1a4e57`, título "Imports", nota "Port → City" y contador de viajes.
- **Export** = contenedor que va de una ciudad hacia un muelle. Encabezado igual pero con tile en `#4a909f` y el camión espejado, título "Exports", nota "City → Port" y contador.

### Fila de viaje

Cada fila muestra, de izquierda a derecha:

1. **Miniatura del camión** (56×44, esquinas redondeadas). Debe poder asociarse una foto por camión; mientras no haya foto real se muestra un placeholder.
2. **Bloque de información** en tres líneas: nombre del **Client**; **ruta** (`From → To`); y **camión · chofer** ("AM-2021 · Armando Peña") o "Truck not assigned" si está libre.
3. **Línea naviera** (Line) en un chip, centrado en su propia columna, alineado verticalmente con el status.
4. **Status** en un label de color con punto y chevron.
5. **Icono de lápiz** al final de la fila.

Las filas **no** son clicleables. Solo son interactivos el label de status y el lápiz.

### Editar camión y chofer (icono de lápiz)

- Al pulsar el lápiz, la línea de "camión · chofer" se sustituye por **dos selects**: uno con el listado de camiones y otro con el listado de choferes; ambos con el valor actual preseleccionado y una opción vacía ("— No truck —" / "— No driver —").
- El lápiz se convierte en un botón de confirmación (check) que cierra la edición.
- La fila en edición se resalta (fondo suave y barra de acento a la izquierda).
- Los cambios se guardan en el viaje.

### Cambiar status (label de status)

- El label de status es un botón; al pulsarlo abre un menú con los estados disponibles: **Scheduled**, **At port**, **On the road**, **Paused**, **Delayed**, **Completed**.
- El estado actual aparece resaltado en el menú. Al elegir otro se actualiza el viaje al instante.
- El menú se cierra al pulsar fuera y debe abrirse hacia arriba cuando no cabe hacia abajo (no puede quedar recortado por la tarjeta).
- Cada estado tiene su color: Scheduled gris azulado, At port azul, On the road verde, Paused ámbar, Delayed rojo, Completed gris.

### Pie del widget

- A la izquierda: "N trips still without a truck assigned."
- A la derecha: leyenda con el punto de color y el nombre de cada status.

### Datos por viaje

`type` (import/export), `client`, `line` (naviera), `from`, `to`, `truck`, `driver`, `status`, fecha del viaje y foto asociada al camión.

### Responsive del widget

- Dos columnas lado a lado solo cuando cada mitad dispone de ~400px reales (descontando el sidebar); por debajo, Imports y Exports se apilan verticalmente.
- En anchos intermedios se oculta primero la miniatura del camión y el chip de naviera pasa a integrarse en la línea de camión·chofer ("Maersk · AM-2021 · Armando Peña"), antes de recortar el nombre del cliente.
- La columna de status reserva un ancho mínimo fijo para que el label nunca se solape con la ruta ni el chofer.

---

## Notas generales

- Todas las fechas y horas se calculan en hora local (no UTC).
- El listado de camiones y choferes debe venir de sus propios catálogos, no del viaje.
- Datos de prueba: usa clientes, navieras (Maersk, CMA CGM, MSC, Hapag-Lloyd, Evergreen), ciudades y muelles dominicanos (Caucedo, Río Haina, Puerto Plata, Santiago, La Vega, Bonao, Moca) como en el diseño de referencia.
- El resto de las secciones del menú aún no está diseñado: deja sus rutas creadas pero vacías.
