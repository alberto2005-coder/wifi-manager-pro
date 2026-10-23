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
2.  **Node.js** 24.22.1+ (LTS recomendado; también válido 22.23.4+ o 26.12.1+) -> [Descargas Node.js](https://nodejs.org/)
3.  **Git** para control de versiones.

> El componente servidor fija la versión en `.nvmrc` y `engines`; `npm install` falla con Node
> 16/18/20 (EOL y sin parches). Si solo usas la app Flutter, Node no es necesario.

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

Este proyecto está bajo la Licencia GPL-3.0. Consulta el archivo `LICENSE` para obtener más detalles.

---

Desarrollado con ❤️ por **Alberto**.

# 📶 WiFi Manager Pro

A powerful dual-solution suite (native Desktop Client in **Flutter** and Web Console in **Node.js**) designed to manage, audit, analyze, and monitor wireless connections and local area networks.

This ecosystem provides full management of Windows Wi-Fi profiles, nearby channel spectrum analysis, active device scanning, fast security audits, and real-time bandwidth monitoring.

---

## 🚀 Key Features

### 💻 Desktop Client (Flutter)

* **Native Wireless Management:** Connect to and forget Wi-Fi network profiles directly via system commands (`netsh wlan`).
* **Integrated Speed Test:** Real-world measurements for download (Cloudflare CDN) and upload (HTTP POST against the local Node.js server).
* **Real-Time Traffic Monitor:** Real-time line chart displaying download and upload rates (Mbps) across active network adapters.
* **Security Audit:** Automated diagnostics evaluating password complexity and encryption protocols for saved networks.
* **LAN Scanner (ARP):** Fast discovery of active devices connected to the same subnet.
* **Port Scanner:** Utility to scan standard open TCP ports on any target IP address.
* **Key Generator:** High-entropy, military-grade password generator.

### 🌐 Web Console (Node.js & Vanilla JS/CSS)

* **Modern Dashboard:** Unified interface with seamless tab navigation (Dashboard, Security & Channels, Pro Tools, Settings).
* **Multi-Language & Theme Support:** Instant toggling between English and Spanish, as well as Light and Dark modes. Preferences persist in `localStorage`.
* **Wi-Fi Channel Map:** Interactive Chart.js visualization mapping channel occupancy across nearby networks to identify congestion.
* **Web Traffic Monitoring:** Interactive real-time graph tracking host bandwidth utilization.
* **Diagnostics Console:** One-click execution of system utilities such as `flushdns`, `release`, and `renew` IP.

---

## 🛠️ Built With

* **Flutter (Dart):** Responsive desktop UI for the native Windows client.
* **Node.js & Express:** Backend server hosting scan endpoints, upload speed test targets, and hardware metrics.
* **Chart.js / FL Chart:** Dynamic data visualization for traffic analysis and channel spectrums.
* **HTML5, Vanilla CSS & Modern JS:** Lightweight, responsive web interface built without heavy framework dependencies.

---

## 📋 Prerequisites

Ensure the following tools are installed before proceeding:

1. **Flutter SDK** (Version 3.27 or higher recommended) -> [Installation Guide](https://docs.flutter.dev/get-started/install)
2. **Node.js** 24.22.1+ (LTS recommended; 22.23.4+ or 26.12.1+ also valid) -> [Node.js Downloads](https://nodejs.org/)
3. **Git** for version control.

> The server component pins the runtime in `.nvmrc` and `engines`; `npm install` fails on
> Node 16/18/20 (EOL, unpatched). If you only use the Flutter app, Node is not required.

---

## 📦 Setup and Execution

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd wifi

```

### 2. Start the Backend Server (Node.js)

The backend powers the web interface and handles the upload speed test endpoint for the Flutter application.

```bash
# Install server dependencies
npm install

# Start in development mode
npm run dev

```

The server will be reachable at: `http://localhost:3000`

### 3. Launch the Desktop Application (Flutter)

Open a separate terminal session at the project root to run the Windows desktop client:

```bash
# Fetch Flutter packages
flutter pub get

# Run the project on Windows Desktop
flutter run -d windows

```

---

## 🛡️ Wi-Fi Security Audit

The system evaluates saved wireless networks, generating a security score from **0% to 100%** based on the following criteria:

* **Deprecated Encryption (WEP / WPA1):** Heavy scoring penalty due to well-documented critical vulnerabilities.
* **Short Passwords (< 8 characters):** Security warning highlighting exposure to brute-force attacks.
* **Recommended Encryption (WPA2/WPA3 AES):** Awards the highest security score.

---

## 📂 Project Structure

```
wifi/
├── lib/                     # Flutter source code
│   ├── localization/        # Multi-language support (ES/EN)
│   ├── models/              # Data models (Network, Device, etc.)
│   ├── providers/           # Global state management (NetworkProvider)
│   ├── screens/             # UI screens (Traffic, Analyzer, Tools)
│   ├── services/            # Native services (WiFi netsh, SpeedTest, Storage)
│   └── main.dart            # Entry point & App Dashboard
├── public/                  # Web Frontend (served by Node.js)
│   ├── index.html           # Web console markup
│   ├── index.css            # Modern styling and light/dark theme variables
│   └── script.js            # Client-side logic, Chart.js, and translations
├── assets/                  # Icons and localization JSON files
├── server.js                # Express backend server and system APIs
├── package.json             # Node.js dependencies
└── pubspec.yaml             # Flutter configuration and dependencies

```

---

## 📄 License

This project is licensed under the GPL-3.0 License. See the `LICENSE` file for details.

---

Developed with ❤️ by **Alberto**.
