# AGENTS.md

Reglas operativas para cualquier agente de IA (Claude Code u otro) que trabaje en este repositorio.

## Regla #1 — Testing obligatorio

- Ningún cambio de lógica de negocio, endpoint, controlador, modelo o componente se considera completo sin al menos un test en Pest que lo cubra.
- Cuando sea razonable, sigue TDD: escribe el test primero, confirma que falla, implementa el código, confirma que el test pasa.
- Antes de reportar una tarea como terminada, corre `php artisan test` y confirma que todo pasa en verde. Si algo falla, no se entrega la tarea.
- Los tests van en `tests/Feature` (comportamiento end-to-end de un endpoint/flujo) o `tests/Unit` (lógica aislada), organizados por módulo igual que el código de producción.
- Usa la sintaxis de Pest (`it('...', function () { ... })` / `test('...', ...)`), no la sintaxis de clases de PHPUnit, salvo que el archivo ya exista en ese formato.

## Regla #2 — Estilo y formato

- Corre `./vendor/bin/pint` antes de cualquier commit que toque PHP.
- Corre `npm run check` antes de cualquier commit que toque frontend.
- No mezcles cambios de formato masivo con cambios funcionales en el mismo commit.

## Regla #3 — Base de datos

- Toda migración nueva debe ser reversible (`up`/`down` coherentes).
- No modifiques una migración que ya se corrió en un ambiente compartido; crea una nueva migración para el cambio.
- Usa factories y seeders de Laravel para datos de prueba, nunca datos reales.

## Regla #4 — Seguridad

- Nunca commitees `.env`, credenciales, tokens o llaves.
- Toda entrada de usuario se valida con Form Requests, nunca directamente en el controlador.
- Cualquier endpoint que exponga datos de clientes, choferes o facturación requiere autenticación y autorización explícita (policies/gates).

## Regla #5 — Cuando falte información

- Si los requerimientos no especifican un comportamiento (ej. qué pasa si un viaje se cancela después de asignado), no lo inventes en silencio: pregunta o deja un TODO explícito y documentado, nunca una suposición oculta.

## Regla #6 — Commits y alcance

- Un commit = un cambio lógico coherente (incluye su test).
- No agrupes múltiples módulos no relacionados en un mismo commit o PR.
- Actualiza `CLAUDE.md` cuando el cambio afecte comandos, estructura o convenciones generales del proyecto.

## Regla #7 — Entorno local (Herd)

- El proyecto corre con Laravel Herd, no con Docker/Sail. Nunca agregues `docker-compose.yml`, configuración de Sail, ni instrucciones que asuman contenedores.
- El sitio se sirve solo en `https://larimartruck.test` en cuanto la carpeta está "parkeada" o "linkeada" en Herd; no uses `php artisan serve`.
- La base de datos MySQL es el servicio integrado de Herd Pro. Las credenciales viven únicamente en `.env` (nunca hardcodeadas en código o migraciones).

## Estructura de módulos (convención)

Cuando se implemente un módulo de negocio (ej. `Fleet`, `Trips`, `Drivers`), la estructura esperada es:

```
app/
  Http/Controllers/Fleet/
  Models/Vehicle.php
  Policies/VehiclePolicy.php

resources/js/
  Pages/Fleet/

tests/
  Feature/Fleet/
  Unit/Fleet/

database/
  migrations/        (prefijo descriptivo, orden cronológico)
  factories/
  seeders/
```
