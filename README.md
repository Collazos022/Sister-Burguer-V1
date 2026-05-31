# Sister Burguer POS - Versión Estable V1

Bienvenido a la versión estable 1.0 de la aplicación administrativa y POS de Sister Burguer.

## Características Principales

1. **Arquitectura PWA (Progressive Web App)**
   - Soporte para funcionamiento Offline.
   - Guardado automático en caché para tiempos de carga ultrarrápidos.
   - Instalable en celulares (iOS/Android) como una aplicación nativa.

2. **Panel Administrativo Multiusuario**
   - Control de roles integrado (Administrador, Servicio POS, Cocina).
   - Layout diseñado con *Glassmorphism* moderno, sin colores planos, usando tipografía premium (Plus Jakarta Sans).
   - Menú de navegación inferior exclusivo para móviles con botones adaptados.

3. **Módulo de Compras y Gastos (Optimizados)**
   - Sistema de registro masivo (lotes) de inventario y gastos operacionales.
   - Auto-sincronización en la nube con Google Sheets, conservando todas las fórmulas de la base de datos de manera nativa.

4. **Sincronización en Tiempo Real**
   - Integración con API de Google Apps Script.
   - Manejo de flujo seguro (fetch/push) para evitar cruces de celdas y garantizar integridad de datos.

## Estructura de Archivos (Versión Limpia)

Esta versión es el backup final estable, el repositorio ha sido purgado de archivos temporales y scripts de pruebas.

- `index.html`: UI / Front-End
- `style.css`: Hojas de estilo y diseño responsivo
- `app.js`: Lógica de la aplicación y comunicación API
- `sw.js`: Service Worker (Caché y funcionalidad Offline)
- `manifest.json`: Configuración de la App Móvil
- `apps-script/`: Carpeta del backend para subir a Google Apps Script (`clasp`)

## Notas de Despliegue

La página está actualmente alojada en **GitHub Pages**. Para futuras modificaciones:
1. Modificar los archivos locales.
2. Si se cambian archivos visuales o JS, incrementar la versión en `sw.js` (ej. `CACHE_NAME = 'sb-admin-cache-vX'`).
3. Hacer un `git add .`, `git commit -m "mensaje"`, y `git push origin main`.
4. Esperar ~2 minutos y forzar limpieza de caché en los dispositivos (`Ctrl + F5` en Windows, o reiniciar App en móvil).
