# 📶 WiFi Manager Pro

Una potente solución dual (Cliente de Escritorio nativo en **Flutter** y Consola Web en **Node.js**) diseñada para administrar, auditar, analizar y monitorizar conexiones inalámbricas y redes locales.

Este ecosistema permite un control completo de perfiles WiFi en Windows, análisis de espectro de canales cercanos, escaneo de dispositivos activos, auditorías de seguridad rápidas y monitorización de ancho de banda en tiempo real.

---

## 🚀 Características Clave

### 💻 Cliente de Escritorio (Flutter)
*   **Gestión Inalámbrica Nativa:** Conéctate y olvida perfiles de red WiFi directamente utilizando comandos de sistema (`netsh wlan`).
*   **Prueba de Velocidad Integrada:** Medición real de bajada (Cloudflare CDN) y subida (HTTP POST contra servidor Node.js local).
*   **Monitor de Tráfico en Tiempo Real:** Gráfica de líneas en tiempo real mostrando Mbps de descarga/subida de los adaptadores de red activos.
*   **Auditoría de Seguridad:** Diagnóstico automático de la robustez de las contraseñas y protocolos de cifrado de tus redes guardadas.
*   **Escáner LAN (ARP):** Detección rápida de dispositivos conectados a la misma subred.
*   **Escáner de Puertos:** Utilidad para verificar puertos TCP estándar abiertos en cualquier dirección IP.
*   **Generador de Claves:** Generador de contraseñas de grado militar de alta entropía.

### 🌐 Consola Web (Node.js & Vanilla JS/CSS)
*   **Dashboard Moderno:** Interfaz unificada con navegación fluida por pestañas (Dashboard, Seguridad y Canales, Herramientas Pro, Configuración).
*   **Soporte Multiidioma & Temas:** Alternancia instantánea entre Español e Inglés y Modos Claro y Oscuro. Las preferencias se guardan de forma persistente en `localStorage`.
*   **Mapa de Canales WiFi:** Gráfico interactivo alimentado por Chart.js que visualiza la ocupación de canales inalámbricos cercanos para detectar saturaciones.
*   **Monitorización de Tráfico Web:** Gráfico interactivo en tiempo real del uso de banda ancha de tu equipo.
*   **Consola de Diagnósticos:** Acceso directo a utilidades de sistema como `flushdns`, `release` y `renew` de IP.

---

## 🛠️ Tecnologías Utilizadas

*   **Flutter (Dart):** UI responsiva del cliente nativo de escritorio (Windows).
*   **Node.js & Express:** Servidor backend para endpoints de escaneo, pruebas de carga (upload speed test) y estadísticas de hardware.
*   **Chart.js / FL Chart:** Gráficos estadísticos e interactivos para el tráfico y espectro de canales.
*   **HTML5, Vanilla CSS & Modern JS:** Interfaz web ultraligera y responsiva, diseñada sin frameworks pesados ni dependencias externas complejas.

---

## 📋 Requisitos Previos

Asegúrate de tener instalados los siguientes componentes antes de comenzar:
1.  **Flutter SDK** (Versión 3.27 o superior recomendada) -> [Guía de Instalación](https://docs.flutter.dev/get-started/install)
2.  **Node.js** (Versión 16.x o superior recomendada) -> [Descargas Node.js](https://nodejs.org/)
3.  **Git** para control de versiones.

---

## 📦 Configuración y Ejecución

### 1. Clonar el repositorio
```bash
git clone <URL_DE_TU_REPOSITORIO>
cd wifi
```

### 2. Iniciar el Servidor Backend (Node.js)
El backend es necesario tanto para la interfaz web como para realizar el test de subida real en la aplicación Flutter.
```bash
# Instalar dependencias del servidor
npm install

# Iniciar en modo desarrollo
npm run dev
```
El servidor estará disponible en: `http://localhost:3000`

### 3. Iniciar la Aplicación de Escritorio (Flutter)
Abre otra terminal en la raíz del proyecto para ejecutar el cliente Windows:
```bash
# Obtener paquetes de Flutter
flutter pub get

# Ejecutar el proyecto para Windows Desktop
flutter run -d windows
```

---

## 🛡️ Auditoría y Seguridad WiFi
El sistema evalúa tus redes inalámbricas guardadas asignándoles una calificación de **0% a 100%** según los siguientes parámetros:
*   **Cifrados obsoletos (WEP / WPA1):** Penalización alta debido a vulnerabilidades críticas conocidas.
*   **Longitud de clave corta (< 8 caracteres):** Advertencia de seguridad por susceptibilidad a ataques de fuerza bruta.
*   **Cifrados recomendados (WPA2/WPA3 AES):** Otorga la puntuación máxima de seguridad.

---

## 📂 Estructura del Proyecto

```
wifi/
├── lib/                     # Código fuente de Flutter
│   ├── localization/        # Gestor de idiomas (ES/EN) de la app
│   ├── models/              # Modelos de datos (Network, Device, etc.)
│   ├── providers/           # Manejo de estado global (NetworkProvider)
│   ├── screens/             # Vistas de la app (Traffic, Analyzer, Tools)
│   ├── services/            # Servicios nativos (WiFi netsh, SpeedTest, Storage)
│   └── main.dart            # Entrada principal y Dashboard de la App
├── public/                  # Interfaz Frontend Web (servida por Node.js)
│   ├── index.html           # Estructura del panel web
│   ├── index.css            # Estilos modernos y modo claro/oscuro
│   └── script.js            # Lógica cliente, Chart.js y traducciones
├── assets/                  # Iconos y archivos de idioma JSON
├── server.js                # Servidor express backend y APIs de sistema
├── package.json             # Dependencias de Node.js
└── pubspec.yaml             # Configuración y dependencias de Flutter
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para obtener más detalles.

---

Desarrollado con ❤️ por **Alberto**.
