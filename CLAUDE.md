# CLAUDE.md

## Proyecto

LarimarDOM — TMS (mercado dominicano), parte del Larimar Suite.

## Stack

- Backend: PHP 8.4, Laravel 12
- Frontend: React + Inertia.js + Tailwind CSS (starter kit oficial de Laravel)
- Base de datos: MySQL 8 (servicio integrado de Laravel Herd Pro)
- Entorno local: Laravel Herd (PHP y Node nativos, sin Docker/Sail)
- Testing: Pest (obligatorio, ver sección de Testing)

## Comandos esenciales

- El sitio corre vía Herd en `https://larimar-dom.test` (no usar `php artisan serve`).
- Frontend dev (Vite/HMR): `npm run dev`
- Build de producción/assets: `npm run build`
- Migraciones: `php artisan migrate`
- Tests: `php artisan test` (o `./vendor/bin/pest`)
- Lint PHP: `./vendor/bin/pint`
- Lint frontend: `npm run check`
- Tipos TS: `npm run types:check`

## Nota de entorno (PHP)

Herd gestiona PHP 8.4. Si al correr artisan desde la terminal ves warnings de extensión, abre un terminal desde la app de Herd o asegúrate de que el PATH apunte al PHP de Herd. El `php.ini` correcto está en:
`~/Library/Application Support/Herd/config/php/84/php.ini`

## Convenciones de código

- PHP sigue PSR-12, formateado con Laravel Pint antes de cada commit.
- JS/TS sigue la configuración del starter kit (verificar con `npm run check`).
- Commits en formato Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`, etc.), en inglés.
- Cada módulo de negocio vive en su propia carpeta dentro de Controllers, Pages y tests (ver AGENTS.md para el detalle operativo).

## Testing (obligatorio)

Toda funcionalidad nueva, corrección de bug, o cambio de lógica de negocio DEBE incluir su(s) test(s) en Pest antes de darse por completada. No se considera terminada una tarea si `php artisan test` no pasa en verde. Ver AGENTS.md para las reglas exactas.

## Estado del proyecto

| Módulo                                   | Estado                               |
| ---------------------------------------- | ------------------------------------ |
| Scaffold base                            | Completo                             |
| Autenticación (starter kit)              | Incluido                             |
| Módulos de negocio (viajes, flota, etc.) | Pendiente — esperando requerimientos |

Este archivo se actualiza a medida que el proyecto avanza.
