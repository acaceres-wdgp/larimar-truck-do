# Handoff LarimarTruck → Claude Code

Descomprime este contenido en la carpeta `handoff/` de tu repositorio, sin mover nada de sitio:

```
handoff/
  prompt-2-larimartruck.md          ← login, layout admin y Trip control board (implementado)
  prompt-3-trucks.md                ← Trucks: grid + formulario (entregado)
  prompt-4-drivers-profiles.md      ← Drivers + perfiles de camión y chofer (entregado)
  prompt-5-clients.md               ← Clients: grid, perfil y formulario (entregado)
  prompt-6-catalogs-trips.md        ← Catalogs (navieras, ciudades, puertos) + agendar viajes (entregado)
  prompt-7-users-permissions.md     ← NUEVO: Settings con usuarios y permisos
  design-reference/
    LarimarTruck.dc.html            ← prototipo actualizado (todas las pantallas)
    support.js, image-slot.js
    assets/
  assets/
  LEEME.md
```

Abre `handoff/design-reference/LarimarTruck.dc.html` en el navegador para ver el diseño.
En **Tweaks**, `startView` abre directo: `login`, `dashboard`, `schedule trip`, `trucks`, `truck profile`, `new truck`, `drivers`, `driver profile`, `new driver`, `clients`, `client profile`, `new client`, `catalogs`, `users`, `new user`.

## Cómo usarlo en VS Code

1. Sobreescribe la carpeta `handoff/` de tu repo con esta versión (el prototipo cambió).
2. Terminal en la raíz del repo → `claude`.
3. Prompt:

    Lee handoff/prompt-7-users-permissions.md y su referencia de diseño en
    handoff/design-reference/LarimarTruck.dc.html, e implementa la sección Settings
    con pestañas, el módulo de usuarios y la matriz de permisos, aplicándolos también
    en el sidebar y en el servidor, adaptándolo al layout, componentes y convenciones
    que ya existen en el proyecto. No rediseñes el login, el layout admin, el Trip
    control board, ni los módulos de camiones, choferes, clientes y catálogos ya
    implementados.
