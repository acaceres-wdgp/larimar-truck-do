# LarimarTruck — Prompt 7: Settings con usuarios y permisos

Implementa lo siguiente sobre lo que ya existe. Este documento cubre **solo** lo nuevo desde el prompt 6:

1. **Settings pasa a ser una sección con pestañas**: `Catalogs` (ya implementado) y `Users & permissions` (nuevo).
2. **Users**: listado, invitación, edición, suspensión y borrado de usuarios.
3. **Permisos por usuario**: matriz de 8 módulos × 4 acciones, con roles predefinidos como preset.
4. **Aplicación real de los permisos** en el sidebar y en las acciones de cada módulo.

No rediseñes login, layout admin, Trip control board, Trucks, Drivers, Clients ni Catalogs.

## Referencia de diseño (leer primero)

```
handoff/
  prompt-7-users-permissions.md     ← este documento
  design-reference/
    LarimarTruck.dc.html            ← prototipo actualizado (incluye Users & permissions)
    support.js, image-slot.js       ← runtime del prototipo (NO usar en el proyecto)
    assets/
  assets/
```

Abre **`handoff/design-reference/LarimarTruck.dc.html`**. En _Tweaks_, `startView` abre directo `users` y `new user` (además de las pantallas anteriores).

Reglas de uso de la referencia: igual que en los prompts anteriores — referencia **visual y de comportamiento**, no código a copiar; **manda la estructura, nombres, componentes y convenciones del proyecto**; reutiliza tarjetas, chips de estado, botones de acción y patrones de formulario ya creados. No lleves `support.js` ni `image-slot.js` al proyecto.

Paleta, tipografías e idioma: los ya definidos.

---

## 1. Settings como sección con pestañas

El ítem **Settings** del sidebar sigue entrando por `Catalogs`. La página ahora tiene una cabecera común:

- Breadcrumb "Home / Settings / Catalogs" o "Home / Settings / Users & permissions".
- Título **"Settings"** (Bitter 25px) — el título del catálogo pasa a ser el de la tarjeta, como ya está.
- A la derecha, **un solo botón primario contextual**: "Add shipping line" / "Add city" / "Add port" en Catalogs, **"Invite user"** en Users.
- Debajo, una fila de **pestañas subrayadas** (no píldoras — las píldoras se reservan para las tres sub-pestañas de catálogos): `Catalogs` (icono `library-big`) y `Users & permissions` (icono `shield-check`). Activa: texto `#123238`, peso 600, borde inferior 2px `#1a4e57`; inactiva: `#5E7A80`, sin borde.

La pantalla de catálogos no cambia por dentro; solo pierde su cabecera propia y hereda la de Settings.

---

## 2. Users (listado)

**Tarjeta "Users"**, subtítulo "People with access to LarimarTruck. Permissions are set per user.", con buscador a la derecha (placeholder "Search name, email or role") que filtra por nombre, email, rol y cargo.

**Columnas:** User · Role · Access · Last active · Status · Actions.

- **User**: avatar circular de 34px con iniciales (fondo pastel derivado del nombre — sin subir fotos en esta versión), nombre en 13.5px `#123238` clicleable (abre el formulario de edición) y email debajo en 11.5px `#5E7A80`.
- **Role**: chip con el color del rol (ver tabla más abajo).
- **Access**: resumen legible de los módulos con permiso de lectura — "All modules", "No access", o los dos primeros más "+N" (p. ej. "Dashboard, Trips +3").
- **Last active**: "Active now", "2 hours ago", "Yesterday", "3 days ago", "Never".
- **Status**: chip clicleable que alterna **Active** ↔ **Suspended** (verde / rojo). **Invited** (ámbar) es el estado de un usuario que aún no aceptó la invitación; se vuelve Active al aceptarla.
- **Actions**: lápiz (editar) y papelera (eliminar).

**Protecciones:** el usuario no puede suspenderse ni eliminarse a sí mismo (papelera deshabilitada, icono `#B9C9CC`, borde `#EDF3F4`, toast "You can't remove your own account"). Tampoco se puede dejar la cuenta sin ningún administrador activo: si es el último Administrator, bloquéalo con el toast "There must be at least one active administrator".

**Pie de tarjeta:** izquierda `"{n} users · {n} active · {n} invited"`; derecha "Suspending a user keeps their history but blocks sign-in.".

**Tarjeta "Roles"** debajo del listado: subtítulo "Presets that fill the permission grid. A user can be adjusted beyond their role." y una tarjeta por rol con punto de color, nombre, conteo de usuarios y descripción.

**Responsive** (ancho disponible = ventana − sidebar), pistas = celdas renderizadas:

- **≥1180px:** `minmax(0,1.6fr) 132px minmax(0,1fr) 116px 108px 78px`.
- **≥940px:** se oculta Access → `minmax(0,1.6fr) 132px 116px 108px 78px`.
- **<940px:** se ocultan Role, Access y Last active → `minmax(0,1fr) 108px 78px`.

Tarjetas de rol: 5 columnas ≥1100px, 2 columnas ≥780px, 1 columna por debajo.

---

## 3. Invite / Edit user (formulario)

Misma estructura que los otros formularios: tarjeta de campos (1.7fr) + columna lateral (1fr) que se apila por debajo de ~1080px.

**Cabecera:** breadcrumb "Home / Settings / Users / New user" (Users enlaza al listado) o el nombre del usuario al editar; título **"Invite a user"** / **"Edit {nombre}"**; botones **Cancel** y **Send invitation** / **Save changes**.

**Tarjeta "Account"**, nota "Fields marked with * are required.". Grupos separados por línea:

1. **Datos** (dos columnas): Full name*, Work email*, Phone, Job title.
2. **ROLE** — rejilla de tarjetas seleccionables (3 col ≥1000px, 2 ≥700px, 1 por debajo) con punto de color, nombre y descripción: los cinco roles más **Custom**. Elegir un rol **rellena la matriz de permisos** con su preset; tocar cualquier casilla después cambia el rol mostrado a **Custom** automáticamente (y si las casillas vuelven a coincidir exactamente con un preset, el rol vuelve a ese nombre). Seleccionada: borde `#4a909f`, fondo `#EDF8F9`.
3. **PERMISSIONS** — encabezado con los botones secundarios "Select all" y "Clear all", y la matriz.

**Matriz de permisos:** filas = módulos, columnas = View · Create · Edit · Delete. Módulos: Dashboard, Trips & scheduling, Trucks, Drivers, Clients, Invoices, Reports, Settings & users (cada uno con su icono lucide; el icono se atenúa a `#AFC4C8` cuando el módulo no tiene View). Casilla = cuadrado 22px redondeado; activa `#1a4e57` con check blanco, inactiva blanca con borde `#DCE8EA`. Filas alternas `#FFFFFF`/`#FBFDFD`. Rejilla `minmax(0,1.6fr) repeat(4,62px)` (≥820px) o `repeat(4,44px)` por debajo.

**Regla de dependencia:** activar Create, Edit o Delete enciende View automáticamente; mientras alguno de los tres esté activo, View queda **bloqueada** (fondo `#4a909f`, cursor not-allowed, toast "View stays on while create, edit or delete are granted"). Apagar View apaga las otras tres.

**Columna lateral:**

- Tarjeta de resumen en vivo: avatar con iniciales, nombre y email (placeholders "New user" / "no email yet"), y las filas **Role**, **Modules allowed** ("{n} of 8") y **Can delete records** (Yes en `#B14C3C` / No).
- **Account status**: dos botones, Active y Suspended.
- Casilla "Email an invitation so they can set their own password." (marcada por defecto al invitar).
- Nota informativa en bloque `#F4FAFB`: "View is required — granting create, edit or delete turns it on automatically. Settings access lets a user manage catalogs and other users.".

**Validación** (bloque rojo al pie de la tarjeta, en este orden): "Full name is required." · "Enter a valid work email." · "That email already has an account." · "Give the user access to at least one module.".

**Al guardar:** vuelve al listado con toast "Invitation sent to {email}" o "{nombre} updated". Un usuario nuevo creado con la casilla de invitación marcada entra con estado **Invited** y `last_active = "Never"`.

---

## 4. Roles predefinidos

| Rol           | Color del punto | Permisos del preset                                                                                                        |
| ------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Administrator | `#1a4e57`       | Todo (view/create/edit/delete en los 8 módulos)                                                                            |
| Operations    | `#2E8055`       | Dashboard: view · Trips: todo · Trucks/Drivers/Clients: view+create+edit · Invoices: view · Reports: view · Settings: nada |
| Dispatcher    | `#B07C2E`       | Dashboard: view · Trips: view+create+edit · Trucks/Drivers/Clients: view · resto: nada                                     |
| Accountant    | `#4A6BB0`       | Dashboard: view · Trips: view · Clients: view+create+edit · Invoices: todo · Reports: view · resto: nada                   |
| Viewer        | `#8AA4A9`       | view en Dashboard, Trips, Trucks, Drivers, Clients y Reports                                                               |
| Custom        | `#7E9AA0`       | Lo que quede marcado a mano                                                                                                |

Descripciones (se muestran en las tarjetas): Administrator "Full access, including users, catalogs and billing." · Operations "Runs the board and the fleet. No user management." · Dispatcher "Schedules and updates trips. Read-only elsewhere." · Accountant "Invoices, receivables and client billing data." · Viewer "Looks, never touches. Good for owners and auditors." · Custom "Hand-picked permissions.".

Chips de estado: Active `#E6F4EC`/`#1F5C3D`/punto `#2E8055` · Invited `#FBF1DF`/`#7A5312`/punto `#B07C2E` · Suspended `#FCEFEC`/`#8E3626`/punto `#B14C3C`.

---

## 5. Datos y backend

**User** — `name`_, `email`_ (único, login), `phone`, `job_title`, `role` (enum de los 5 roles + `custom`), `status` (`active`/`invited`/`suspended`), `last_active_at` (nullable), `invited_at`, `password_digest` (nullable hasta aceptar la invitación).

**Permission** — una fila por usuario y módulo: `user_id`, `module` (enum: `dashboard`, `trips`, `trucks`, `drivers`, `clients`, `invoices`, `reports`, `settings`), `can_view`, `can_create`, `can_edit`, `can_delete` (booleanos). El rol es solo un preset al crear/editar: **la fuente de verdad son las filas de Permission**, no el nombre del rol.

**Invitación:** al guardar con la casilla marcada, envía un email con token de un solo uso y caducidad (7 días) para que la persona fije su contraseña; al fijarla, el estado pasa a `active`. Incluye reenvío de invitación desde el listado si el proyecto ya tiene infraestructura de correo; si no, deja el usuario en `invited` con contraseña temporal y documenta el TODO.

**Aplicación de permisos (importante — no es solo UI):**

- El **sidebar** oculta los ítems cuyos módulos no tengan `can_view`.
- Cada acción de crear/editar/borrar del resto de la app comprueba el permiso correspondiente **en el servidor** (no basta con esconder el botón); si falta, responde 403 y muestra el toast "You don't have permission to do that".
- El acceso a Settings (catálogos y usuarios) exige `settings.can_view`; gestionar usuarios exige además `settings.can_edit`.
- El usuario en sesión no puede editar sus propios permisos ni su propio rol.

## 6. Alcance y tests

- Solo lo descrito aquí. Orders, Invoices y Reports siguen sin diseñar; sus permisos ya existen en la matriz para cuando lleguen.
- Sin SSO, sin 2FA, sin grupos ni roles editables por el usuario en esta versión.
- Tests: crear usuario válido; las cuatro validaciones; email duplicado; preset de rol rellena la matriz; tocar una casilla pasa el rol a Custom; volver a un preset exacto restaura el nombre del rol; View no se puede apagar mientras haya create/edit/delete; no se puede eliminar la propia cuenta; no se puede dejar cero administradores activos; y que un usuario sin `can_edit` reciba 403 al intentar la acción por API.
