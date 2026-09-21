# LarimarTruck — Prompt 5: módulo Clients (grid, perfil y formulario)

Implementa el módulo **Clients** sobre lo que ya existe. Este documento cubre **solo** lo nuevo desde el prompt 4. No rediseñes login, layout admin, Trip control board, Trucks ni Drivers.

## Referencia de diseño (leer primero)

```
handoff/
  prompt-5-clients.md               ← este documento
  design-reference/
    LarimarTruck.dc.html            ← prototipo actualizado (incluye Clients)
    support.js, image-slot.js       ← runtime del prototipo (NO usar en el proyecto)
    assets/
  assets/
```

Abre **`handoff/design-reference/LarimarTruck.dc.html`** en el navegador. En _Tweaks_, `startView` abre directo: `clients`, `client profile`, `new client` (además de las pantallas anteriores).

Reglas de uso de la referencia (iguales que en los prompts 3 y 4): es referencia **visual y de comportamiento**, no código a copiar; **manda la estructura, nombres, componentes y convenciones del proyecto**; reutiliza el layout admin y los componentes ya creados para Trucks/Drivers (tarjetas de grid, chips de estado, botones de acción, formularios, slot de imagen); no lleves `support.js` ni `image-slot.js` al proyecto.

Paleta y tipografías: las ya definidas (`#1a4e57`, `#123238`, `#4a909f`, `#F2F7F8`, `#FFFFFF`, `#E0EBED`, `#EFF5F6`, `#F4F8F9`, `#5E7A80`, `#7E9AA0`, rojo `#B14C3C`, ámbar `#C68A1E`, verde `#1F5C3D`; Bitter en títulos, Roboto en interfaz, iconos Lucide, interfaz en inglés). Montos en **RD$** con separador de miles.

---

## 1. Pantalla: Clients (grid)

Mismo patrón que Trucks y Drivers.

**Cabecera:** breadcrumb "Home / Clients", título **"Clients"**, botones **"Export"** (secundario) y **"New client"** (primario, icono `plus`).

**Tarjeta del listado:**

- Encabezado: título "Accounts", subtítulo `"{total} clients · {activos} active · RD$ {suma de balances} receivable"`.
- Buscador con icono `search`, placeholder "Name, RNC, contact…" (filtra por nombre, RNC, contacto y email) y pestañas de estado: `All`, `Active`, `Inactive`.

**Columnas:**

| Columna         | Contenido                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Logo            | Cuadrado 44px, radio 10px. Logo del cliente; si no hay, **iniciales** (dos letras) sobre `#E3F1F3` en `#1a4e57`. El logo cargado cubre las iniciales.  |
| Client          | Nombre en 13.5px/500 y, debajo, `"{tipo} · {RNC}"` (en el nivel intermedio solo el RNC).                                                               |
| Primary contact | Nombre del contacto y, debajo, su teléfono en 11px `#7E9AA0`.                                                                                          |
| Terms           | Términos de pago.                                                                                                                                      |
| Balance         | Alineado a la derecha: saldo pendiente en 12.5px/500 y, debajo, `"of RD$ {límite}"`. El saldo va en rojo `#B14C3C` cuando supera el límite de crédito. |
| Status          | Chip: Active verde, Inactive gris.                                                                                                                     |
| Actions         | Ver (`eye`) → perfil · Editar (`pencil`) → formulario precargado · Eliminar (`trash-2`) con toast "{cliente} removed from clients".                    |

- Vacío: "No clients match this filter."
- Pie: `"Showing {n} of {total} clients"` y, a la derecha, `"{n} over their credit limit"`.

**Responsive** (ancho disponible = ventana − sidebar), pistas = celdas renderizadas:

- **≥1260px:** `44px minmax(0,1.35fr) 170px 116px 140px 124px 104px`.
- **≥1000px:** se oculta Terms → `44px minmax(0,1.35fr) 170px 140px 124px 104px`.
- **<1000px:** se ocultan Logo, Primary contact y Balance → `minmax(0,1fr) 120px 100px`.

---

## 2. Pantalla: perfil de cliente

Ruta tipo `clients.show`. Dos columnas: ficha (≈0.85fr) y contenido (≈1.6fr); se apilan por debajo de ~1080px.

**Cabecera:** breadcrumb "Home / Clients / {nombre}" (Clients enlaza al listado), título con el nombre, botones **"Back to clients"** y **"Edit client"** (icono `pencil`, abre el formulario de ese cliente).

**Tarjeta de ficha:** logo cuadrado de 110px centrado (iniciales en Bitter 32px si no hay logo), nombre en Bitter 18px, chip de estado, y grilla de dos columnas con: Client type, RNC / tax ID, Primary contact, Role, Phone, Payment terms, y **Email** y **Client since** a ancho completo.

**Tarjeta "Balance & receivables":** subtítulo `"Payment terms {términos} · updated {hoy}"`. Cuatro celdas separadas por líneas (2×2 en anchos pequeños):

- **Outstanding** — saldo pendiente · nota "{n} open invoices".
- **Overdue 30+** — monto vencido a más de 30 días, en rojo si es mayor que cero · nota "Follow up required" o "Nothing past due".
- **Credit limit** — límite · nota con los términos.
- **Available** — límite menos saldo (mínimo 0), verde `#1F5C3D`, o rojo con nota "Over the limit" si el saldo excede el límite.

Al pie, barra de **Credit used**: porcentaje saldo/límite, con relleno `#4a909f` normal, `#C68A1E` desde 80% y `#C4483A` al 100% o más.

**Tarjeta "Trip history":** subtítulo "Most recent first · {n} trips on record". Columnas: **Date** (fecha + Import/Export, Import `#1a4e57`, Export `#4a909f`), **Route** (`From → To`), **Truck · driver**, **Line**, **Km** (derecha, tabular) y **Status** (chips de estado de viaje). Vacío: "No trips recorded for this client yet.".

Responsive del historial (igual que en los perfiles de camión y chofer):

- **≥1240px:** `104px minmax(0,1.4fr) 140px 108px 84px 132px`.
- **≥940px:** se ocultan Line y Km → `104px minmax(0,1.4fr) 140px 132px`.
- **<940px:** se oculta además Truck · driver → `96px minmax(0,1fr) 124px`.

---

## 3. Pantalla: formulario de cliente

Página propia; misma estructura que los otros formularios: tarjeta de campos (1.7fr) + tarjeta de logo (1fr), apiladas por debajo de ~1080px; campos en dos columnas, una sola por debajo de ~760px.

- Cabecera: breadcrumb "Home / Clients / Back to clients", título **"New client"** o **"Edit {nombre}"**, botones **Cancel** y **Save client**.
- Tarjeta "Client details", nota "Fields marked with * are required.", grupos separados por línea:
    1. **ACCOUNT** — Client type (select: Company, Individual), Status (select: Active, Inactive), Legal name*, RNC / tax ID*.
    2. **PRIMARY CONTACT** — Contact name, Role, Phone, Email.
    3. **BILLING** — Payment terms (select: Cash on delivery, 15 days, 30 days, 45 days, 60 days), Credit limit (RD$).
- **Validación** (bloque rojo al pie + validación de servidor): "Legal name is required.", "RNC / tax ID is required.", y RNC duplicado → "That RNC is already registered to another client.". Al guardar: vuelve al listado con toast "{nombre} added to clients" / "{nombre} updated".
- Tarjeta "Logo": subtítulo "Shown in lists, invoices and trip documents.", zona de 168px de alto con carga y previsualización, nota "PNG with transparent background works best. Without a logo we show the client's initials.".

---

## 4. Datos

Entidad `Client`: `name`* (razón social), `kind` (enum: Company, Individual), `tax_id`* (RNC/cédula, único), `contact_name`, `contact_role`, `contact_phone`, `contact_email`, `payment_terms` (enum de los cinco valores), `credit_limit` (decimal), `status` (enum: Active, Inactive), `logo_path`, `client_since` (date).

- El cliente del **Trip control board** y de los viajes apunta a esta entidad (una sola fuente de verdad, no texto libre).
- **Saldo, vencido a 30+ días y facturas abiertas se calculan** desde las facturas del cliente; si el módulo de facturación aún no existe, expón los cálculos en un servicio/acessor con datos derivados de los viajes y déjalo listo para conectar Invoices después — no guardes el saldo como columna editable.
- El **historial de viajes** son los viajes del cliente ordenados por fecha descendente, con los mismos campos que ya usan los perfiles de camión y chofer.
- Fechas en hora local; montos en RD$.
- Semillas: los 10 clientes de la referencia (Imagine SRL, América Internacional, Grupo Ramos, Distribuidora Corripio, Ferretería Ochoa, Agroindustrial del Cibao, Industria Blanca SRL, Tabacalera del Norte, Cementos Cibao y un cliente persona física) con sus RNC, contactos, términos, límites y estados. Nota: Ferretería Ochoa está por encima de su límite y América Internacional tiene monto vencido — sirven para ver los estados rojos.

## 5. Alcance y tests

- Solo lo descrito aquí; el resto del menú sigue sin diseñar.
- Tests siguiendo el patrón del proyecto: listado con búsqueda y filtro de estado; creación válida; validación de nombre y RNC requeridos y RNC duplicado; edición; borrado; y que el perfil cargue ficha, cifras de balance y solo los viajes de ese cliente.
