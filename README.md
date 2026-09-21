# LarimarTruck

TMS (Transportation Management System) — parte del Larimar Suite de LarimarDev/WDGP Consulting.

## Requisitos

- [Laravel Herd Pro](https://herd.laravel.com) (PHP 8.4 + Node + MySQL integrados)
- Composer
- Node.js / npm

## Instalación local

```bash
# 1. Clonar el repositorio
git clone <repo-url> larimartruck
cd larimartruck

# 2. Instalar dependencias PHP
composer install

# 3. Configurar entorno
cp .env.example .env
php artisan key:generate

# 4. Crear la base de datos en el servicio MySQL de Herd Pro
#    Desde Herd, activa MySQL y crea la base de datos "larimartruck".
#    Ajusta DB_HOST, DB_PORT, DB_USERNAME y DB_PASSWORD en .env según Herd.

# 5. Correr migraciones
php artisan migrate

# 6. Instalar dependencias frontend y compilar
npm install
npm run build

# 7. Registrar el sitio en Herd
herd link larimartruck
# El sitio estará disponible en https://larimartruck.test
```

## Desarrollo

```bash
# Servidor frontend con hot-reload (Vite)
npm run dev

# Tests
php artisan test

# Lint PHP
./vendor/bin/pint

# Lint frontend
npm run check
```

> **Nota:** El backend lo sirve Herd directamente en `https://larimartruck.test`. No uses `php artisan serve`.

## Documentación interna

- [`CLAUDE.md`](./CLAUDE.md) — stack, comandos esenciales y convenciones del proyecto.
- [`AGENTS.md`](./AGENTS.md) — reglas operativas para agentes de IA que trabajen en el repositorio.
