# Sister Burguer - POS & KDS System 🍔

Sister Burguer es una aplicación web progresiva (PWA) de Punto de Venta (POS) y Sistema de Visualización en Cocina (KDS). Está diseñada para ser rápida, ligera y funcionar de manera optimizada tanto en computadoras de escritorio como en dispositivos móviles y tablets.

## 🚀 Características Principales

- **Interfaz de Punto de Venta (POS):** Toma de pedidos rápida e intuitiva con soporte para mesas, para llevar y domicilios.
- **Cocina (KDS):** Visualización en tiempo real de los pedidos pendientes y preparados para el equipo de cocina.
- **PWA (Progressive Web App):** Instalable en Android, iOS y Windows sin necesidad de tiendas de aplicaciones. Funciona a pantalla completa.
- **Arquitectura Ligera:** Construida 100% con Vanilla JavaScript, HTML5 y CSS3. Sin frameworks pesados que ralenticen dispositivos antiguos.
- **Modo Oscuro Elegante:** Interfaz gráfica moderna optimizada para entornos con poca luz (como barras o cocinas).
- **Backend Serverless:** Integrado directamente con **Google Apps Script** y **Google Sheets** como base de datos en tiempo real.

## 🛠️ Tecnologías

- **Frontend:** HTML, CSS, Vanilla JS
- **Íconos:** Lucide Icons
- **Backend:** Google Apps Script (Clasp)
- **Base de Datos:** Google Sheets API
- **Testing:** Playwright (Headless UI Automation)

## 📂 Estructura del Proyecto

```text
/
├── app.js               # Lógica principal del Punto de Venta y KDS
├── style.css            # Estilos CSS, variables de diseño y Responsive Design
├── index.html           # Interfaz de usuario (Pestañas, Modales, Grillas)
├── sw.js                # Service Worker para caché y funcionalidad PWA
├── manifest.json        # Manifiesto de la aplicación web (Instalabilidad)
├── apps-script/         # Código del servidor (Google Apps Script)
└── package.json         # Dependencias de entorno de desarrollo (Testing & Clasp)
```

## ⚙️ Desarrollo y Pruebas

Para trabajar en el entorno local con las herramientas de pruebas automatizadas:

1. Asegúrate de tener instalado [Node.js](https://nodejs.org/).
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Para interactuar con el backend de Google Apps Script:
   ```bash
   npx clasp login
   npx clasp push
   ```

## 📝 Notas de Versión

- **v2.3+:** Rediseño estético unificado, sistema de _Pills_ para estados de pedidos (Pendiente, Preparado, Entregado), y testing con Playwright.
