# WiFi Manager Pro

[Español](#español) · [English](#english)

---

## Español

### Índice

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Configuración y ejecución](#configuración-y-ejecución)
- [Auditoría de seguridad WiFi](#auditoría-de-seguridad-wifi)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Licencia](#licencia)

### Descripción

Solución doble: un **cliente de escritorio nativo en Flutter** y una **consola web en Node.js**, pensados para administrar, auditar, analizar y monitorizar conexiones inalámbricas y redes locales.

El ecosistema permite controlar los perfiles WiFi de Windows, analizar el espectro de canales cercanos, escanear dispositivos activos, hacer auditorías de seguridad y ver el ancho de banda en tiempo real.

### Características

**Cliente de escritorio (Flutter)**

- **Gestión inalámbrica nativa**: conectar y olvidar perfiles WiFi con comandos del sistema (`netsh wlan`).
- **Prueba de velocidad integrada**: bajada real contra la CDN de Cloudflare y subida por HTTP POST contra el servidor Node.js local.
- **Monitor de tráfico en tiempo real**: gráfica de Mbps de descarga y subida de los adaptadores activos.
- **Auditoría de seguridad**: diagnóstico de la robustez de contraseñas y protocolos de cifrado de las redes guardadas.
- **Escáner LAN (ARP)**: detección de dispositivos en la misma subred.
- **Escáner de puertos**: comprobación de puertos TCP estándar en cualquier IP.
- **Generador de claves** de alta entropía.

**Consola web (Node.js + JS/CSS vanilla)**

- **Dashboard** con pestañas: Dashboard, Seguridad y Canales, Herramientas Pro y Configuración.
- **Multiidioma y temas**: español/inglés y claro/oscuro, guardados en `localStorage`.
- **Mapa de canales WiFi** con Chart.js para detectar saturación.
- **Monitorización de tráfico web** en tiempo real.
- **Consola de diagnósticos**: `flushdns`, `release` y `renew` de IP.

### Tecnologías

| Pieza | Tecnología |
|---|---|
| Cliente de escritorio | Flutter (Dart), FL Chart |
| Backend | Node.js + Express |
| Frontend web | HTML5, CSS vanilla, JS moderno |
| Gráficas | Chart.js / FL Chart |

### Requisitos

1. **Flutter SDK** 3.27 o superior — [guía de instalación](https://docs.flutter.dev/get-started/install).
2. **Node.js** 24.22.1+ (también válido 22.23.4+ o 26.12.1+) — [descargas](https://nodejs.org/).
3. **Git**.

> El servidor fija la versión en `.nvmrc` y `engines`: `npm install` falla con Node 16/18/20 (EOL y sin parches). Si solo usas la app Flutter, no necesitas Node.

### Configuración y ejecución

**1. Clonar el repositorio**

```bash
git clone https://github.com/alberto2005-coder/wifi-manager-pro.git
cd wifi-manager-pro
```

**2. Arrancar el backend**

```bash
npm install
npm run dev
```

El servidor queda en `http://localhost:3000`. Es necesario tanto para la consola web como para el test de subida de la app Flutter.

**3. Arrancar el cliente de escritorio** (en otra terminal, en la raíz del proyecto)

```bash
flutter pub get
flutter run -d windows
```

### Auditoría de seguridad WiFi

El sistema puntúa cada red guardada de **0 % a 100 %**:

- **Cifrados obsoletos (WEP / WPA1)**: penalización alta por vulnerabilidades conocidas.
- **Claves cortas (menos de 8 caracteres)**: advertencia por exposición a fuerza bruta.
- **Cifrados recomendados (WPA2/WPA3 AES)**: puntuación máxima.

### Estructura del proyecto

```text
wifi-manager-pro/
├── lib/                     # Código Flutter
│   ├── localization/        # Gestor de idiomas (ES/EN)
│   ├── models/              # Modelos de datos (Network, Device…)
│   ├── providers/           # Estado global (NetworkProvider)
│   ├── screens/             # Pantallas (Traffic, Analyzer, Tools)
│   ├── services/            # Servicios nativos (netsh, SpeedTest, Storage)
│   └── main.dart            # Entrada y dashboard de la app
├── public/                  # Frontend web servido por Node.js
│   ├── index.html
│   ├── index.css
│   └── script.js
├── assets/                  # Iconos y archivos de idioma JSON
├── server.js                # Backend Express y APIs de sistema
├── package.json
├── pubspec.yaml
├── LICENSE
└── README.md
```

### Licencia

Este proyecto está bajo la **Licencia GPL-3.0**. Consulta [LICENSE](LICENSE).

---

## English

### Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Setup and execution](#setup-and-execution)
- [Wi-Fi security audit](#wi-fi-security-audit)
- [Project structure](#project-structure)
- [License](#license)

### Overview

A dual solution: a **native Flutter desktop client** plus a **Node.js web console**, built to manage, audit, analyze and monitor wireless connections and local networks.

The suite provides full control of Windows Wi-Fi profiles, nearby channel spectrum analysis, active device scanning, quick security audits and real-time bandwidth monitoring.

### Features

**Desktop client (Flutter)**

- **Native wireless management**: connect to and forget Wi-Fi profiles through system commands (`netsh wlan`).
- **Integrated speed test**: real download against the Cloudflare CDN and upload via HTTP POST to the local Node.js server.
- **Real-time traffic monitor**: Mbps line chart for download and upload on active adapters.
- **Security audit**: diagnoses password strength and encryption protocols of saved networks.
- **LAN scanner (ARP)**: discovers devices on the same subnet.
- **Port scanner**: checks standard TCP ports on any IP.
- **High-entropy** password generator.

**Web console (Node.js + vanilla JS/CSS)**

- **Dashboard** with tabs: Dashboard, Security & Channels, Pro Tools and Settings.
- **Multi-language and themes**: English/Spanish and light/dark, persisted in `localStorage`.
- **Wi-Fi channel map** with Chart.js to spot congestion.
- **Real-time web traffic monitoring**.
- **Diagnostics console**: `flushdns`, IP `release` and `renew`.

### Tech stack

| Piece | Technology |
|---|---|
| Desktop client | Flutter (Dart), FL Chart |
| Backend | Node.js + Express |
| Web frontend | HTML5, vanilla CSS, modern JS |
| Charts | Chart.js / FL Chart |

### Requirements

1. **Flutter SDK** 3.27 or later — [installation guide](https://docs.flutter.dev/get-started/install).
2. **Node.js** 24.22.1+ (22.23.4+ or 26.12.1+ also valid) — [downloads](https://nodejs.org/).
3. **Git**.

> The server pins its runtime in `.nvmrc` and `engines`: `npm install` fails on Node 16/18/20 (EOL, unpatched). If you only use the Flutter app, Node is not required.

### Setup and execution

**1. Clone the repository**

```bash
git clone https://github.com/alberto2005-coder/wifi-manager-pro.git
cd wifi-manager-pro
```

**2. Start the backend**

```bash
npm install
npm run dev
```

The server listens on `http://localhost:3000`. It powers both the web console and the Flutter upload speed test.

**3. Launch the desktop client** (second terminal, project root)

```bash
flutter pub get
flutter run -d windows
```

### Wi-Fi security audit

Saved networks are scored from **0 % to 100 %**:

- **Deprecated encryption (WEP / WPA1)**: heavy penalty for well-known vulnerabilities.
- **Short passwords (under 8 characters)**: warning for brute-force exposure.
- **Recommended encryption (WPA2/WPA3 AES)**: top score.

### Project structure

```text
wifi-manager-pro/
├── lib/                     # Flutter source
│   ├── localization/        # Language manager (ES/EN)
│   ├── models/              # Data models (Network, Device…)
│   ├── providers/           # Global state (NetworkProvider)
│   ├── screens/             # Screens (Traffic, Analyzer, Tools)
│   ├── services/            # Native services (netsh, SpeedTest, Storage)
│   └── main.dart            # Entry point and app dashboard
├── public/                  # Web frontend served by Node.js
│   ├── index.html
│   ├── index.css
│   └── script.js
├── assets/                  # Icons and JSON language files
├── server.js                # Express backend and system APIs
├── package.json
├── pubspec.yaml
├── LICENSE
└── README.md
```

### License

This project is licensed under the **GPL-3.0 License**. See [LICENSE](LICENSE).
