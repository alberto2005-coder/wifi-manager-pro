const express = require('express');
const { execFile } = require('child_process');
const https = require('https');
const path = require('path');
const os = require('os');
const net = require('net');
const fs = require('fs');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '127.0.0.1';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Add JSON body parser

// Ejecutar comando seguro sin pasar por shell para prevenir inyección de comandos
function runSafeCommand(file, args = [], options = {}) {
  return new Promise((resolve) => {
    execFile(
      file,
      args,
      {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
        windowsHide: true,
        ...options,
      },
      (err, stdout) => {
        resolve(stdout || '');
      }
    );
  });
}

// Escapar caracteres XML para perfiles de red
function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Verificar si la petición proviene de localhost (loopback)
function isLocalhost(req) {
  const ip = req.socket?.remoteAddress || req.connection?.remoteAddress || '';
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.endsWith('127.0.0.1')
  );
}

// Middleware de autorización para endpoints sensibles (contraseñas, borrar/conectar, diagnósticos)
function requireLocalOrAuth(req, res, next) {
  // Permitido siempre desde localhost
  if (isLocalhost(req)) {
    return next();
  }

  // Si se configuró API_KEY, permitir con cabecera o query param
  const configuredKey = process.env.API_KEY;
  if (configuredKey) {
    const providedKey = req.headers['x-api-key'] || req.query.apiKey;
    if (providedKey && providedKey === configuredKey) {
      return next();
    }
  }

  return res.status(403).json({
    success: false,
    error: 'Acceso no autorizado: la consulta de contraseñas y operaciones del sistema requieren acceso local o autenticación x-api-key.'
  });
}

function scanPort(host, port, timeout = 400) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = 'closed';

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      status = 'open';
      socket.destroy();
    });

    socket.on('timeout', () => {
      socket.destroy();
    });

    socket.on('error', () => {
      socket.destroy();
    });

    socket.on('close', () => {
      resolve({ port, status });
    });

    socket.connect(port, host);
  });
}

// Obtener estadísticas de tráfico de red
async function getNetworkStats() {
  const platform = os.platform();
  if (platform === 'win32') {
    const output = await runSafeCommand('netsh', ['interface', 'ipv4', 'show', 'subinterfaces']);
    const lines = output.split('\n');
    let received = 0;
    let sent = 0;
    for (const line of lines) {
      const match = line.trim().match(/^\d+\s+\d+\s+(\d+)\s+(\d+)\s+(.+)$/);
      if (match) {
        const interfaceName = match[3].toLowerCase();
        if (interfaceName.includes('loopback')) continue;
        received += parseInt(match[1], 10) || 0;
        sent += parseInt(match[2], 10) || 0;
      }
    }
    return { received, sent };
  } else if (platform === 'linux') {
    try {
      const output = fs.readFileSync('/proc/net/dev', 'utf8');
      const lines = output.split('\n');
      let received = 0;
      let sent = 0;
      for (const line of lines) {
        if (line.includes(':') && !line.includes('lo')) {
          const parts = line.split(':')[1].trim().split(/\s+/);
          received += parseInt(parts[0], 10) || 0;
          sent += parseInt(parts[8], 10) || 0;
        }
      }
      return { received, sent };
    } catch (e) {
      return { received: 0, sent: 0 };
    }
  } else if (platform === 'darwin') {
    try {
      const output = await runSafeCommand('netstat', ['-ib', '-I', 'en0']);
      const lines = output.trim().split('\n');
      if (lines.length > 1) {
        return { received: 0, sent: 0 };
      }
    } catch (e) {}
  }
  return { received: 0, sent: 0 };
}

// Obtener gateway (IP del router)
async function getDefaultGateway() {
  const platform = os.platform();
  try {
    if (platform === 'darwin') {
      const stdout = await runSafeCommand('route', ['-n', 'get', 'default']);
      const match = stdout.match(/gateway:\s*([\d.]+)/i);
      return match ? match[1] : null;
    } else if (platform === 'linux') {
      const stdout = await runSafeCommand('ip', ['route', 'show', 'default']);
      const match = stdout.match(/default via\s*([\d.]+)/i);
      return match ? match[1] : null;
    } else {
      const stdout = await runSafeCommand('ipconfig', []);
      const match = stdout.match(/Puerta de enlace predeterminada[.\s]+:\s*([\d.]+)/i)
        || stdout.match(/Default Gateway[.\s]+:\s*([\d.]+)/i);
      return match ? match[1] : null;
    }
  } catch (_) {
    return null;
  }
}

// Obtener IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '192.168.1.1';
}

// Obtener red WiFi actualmente conectada
async function getCurrentNetwork() {
  const platform = os.platform();
  if (platform === 'darwin') {
    const output = await runSafeCommand('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport', ['-I']);
    const ssidMatch = output.match(/\s+SSID:\s+(.+)/i);
    const bssidMatch = output.match(/\s+BSSID:\s+(.+)/i);
    const rateMatch = output.match(/\s+lastTxRate:\s+(\d+)/i);
    const signalMatch = output.match(/\s+agrCtlRSSI:\s+(-?\d+)/i);
    return {
      ssid: ssidMatch ? ssidMatch[1].trim() : null,
      signal: signalMatch ? signalMatch[1].trim() + ' dBm' : null,
      speed: rateMatch ? rateMatch[1].trim() + ' Mbps' : null,
      bssid: bssidMatch ? bssidMatch[1].trim() : null,
      band: 'N/A'
    };
  } else if (platform === 'linux') {
    const output = await runSafeCommand('nmcli', ['-t', '-f', 'active,ssid,signal,bssid,rate', 'dev', 'wifi']);
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.startsWith('yes:')) {
         const parts = line.split(':');
         return {
           ssid: parts[1] || null,
           signal: parts[2] ? parts[2] + '%' : null,
           bssid: parts[3] ? parts[3].replace(/\\/g, '') : null,
           speed: parts[4] || null,
           band: 'N/A'
         };
      }
    }
    return { ssid: null, signal: null, speed: null, bssid: null, band: null };
  } else {
    // Windows
    const output = await runSafeCommand('netsh', ['wlan', 'show', 'interfaces']);
    const ssidMatch   = output.match(/[ \t]SSID[ \t]+:[ \t]+(.+)/);
    const signalMatch = output.match(/Se.al\s*:\s*(\d+)%/i);
    const speedMatch  = output.match(/Velocidad de recepci.n \(Mbps\)\s*:\s*([\d.]+)/i)
                     || output.match(/Receive rate.*?:\s*([\d.]+)/i);
    const bssidMatch  = output.match(/AP BSSID\s*:\s*(.+)/i);
    const bandMatch   = output.match(/Banda\s*:\s*(.+)/i)
                     || output.match(/Band\s*:\s*(.+)/i);
    return {
      ssid:   ssidMatch   ? ssidMatch[1].trim()   : null,
      signal: signalMatch ? signalMatch[1].trim() + '%' : null,
      speed:  speedMatch  ? speedMatch[1].trim()  + ' Mbps' : null,
      bssid:  bssidMatch  ? bssidMatch[1].trim()  : null,
      band:   bandMatch   ? bandMatch[1].trim()   : null,
    };
  }
}

// Obtener todas las redes guardadas con sus contraseñas
async function getSavedNetworks() {
  const platform = os.platform();
  const networks = [];

  if (platform === 'darwin') {
    const output = await runSafeCommand('networksetup', ['-listpreferredwirelessnetworks', 'en0']);
    const lines = output.split('\n').slice(1);
    for (const line of lines) {
      if (line.trim()) {
         networks.push({
            name: line.trim(),
            password: 'Oculta en macOS',
            auth: 'N/A',
            authModes: [],
            cipher: 'N/A',
            mode: 'auto'
         });
      }
    }
  } else if (platform === 'linux') {
    const output = await runSafeCommand('nmcli', ['-t', '-f', 'NAME', 'connection', 'show']);
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.trim()) {
         networks.push({
            name: line.trim(),
            password: 'Oculta en Linux (requiere root)',
            auth: 'N/A',
            authModes: [],
            cipher: 'N/A',
            mode: 'auto'
         });
      }
    }
  } else {
    // Windows
    const profilesOutput = await runSafeCommand('netsh', ['wlan', 'show', 'profiles']);
    const profileMatches = profilesOutput.matchAll(/Perfil de todos los usuarios\s*:\s*(.+)|All User Profile\s*:\s*(.+)/gi);
    const profiles = [];

    for (const match of profileMatches) {
      const name = (match[1] || match[2]).trim();
      if (name) profiles.push(name);
    }

    for (const name of profiles) {
      // Uso de argumentos directos en execFile evita inyección de comandos
      const detail = await runSafeCommand('netsh', ['wlan', 'show', 'profile', `name=${name}`, 'key=clear']);

      const passwordMatch = detail.match(/Contenido de la clave\s*:\s*(.+)|Key Content\s*:\s*(.+)/i);
      let password = passwordMatch ? (passwordMatch[1] || passwordMatch[2]).trim() : null;

      if (process.env.HIDE_PASSWORDS === 'true' && password) {
        password = '••••••••';
      }

      const authAll = [...detail.matchAll(/Autenticaci.n\s*:\s*(.+)|Authentication\s*:\s*(.+)/gi)]
        .map(m => (m[1] || m[2]).trim());
      const authModes = [...new Set(authAll)];
      const auth = authModes[0] || 'Desconocido';

      const cipherMatch = detail.match(/Cifrado\s*:\s*(.+)|Cipher\s*:\s*(.+)/i);
      const cipher = cipherMatch ? (cipherMatch[1] || cipherMatch[2]).trim() : 'Desconocido';

      const modeMatch = detail.match(/Modo de conexi.n\s*:\s*(.+)|Connection mode\s*:\s*(.+)/i);
      const mode = modeMatch ? (modeMatch[1] || modeMatch[2]).trim() : 'Desconocido';

      networks.push({
        name,
        password,
        auth,
        authModes,
        cipher,
        mode,
      });
    }
  }

  return networks;
}

// API: obtener datos de redes (protegido por localhost o API_KEY)
app.get('/api/networks', requireLocalOrAuth, async (req, res) => {
  try {
    const [networks, currentNetwork, gateway, localIP] = await Promise.all([
      getSavedNetworks(),
      getCurrentNetwork(),
      getDefaultGateway(),
      Promise.resolve(getLocalIP()),
    ]);

    // Panel del router real (solo el gateway detectado)
    const uniquePanels = gateway
      ? [{ label: 'Panel del Router', url: `http://${gateway}`, ip: gateway }]
      : [];

    res.json({
      success: true,
      currentNetwork,
      gateway,
      localIP,
      adminPanels: uniquePanels,
      networks,
      total: networks.length,
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// API: escanear redes cercanas (las que Windows/Linux/macOS detecta)
app.get('/api/scan', async (req, res) => {
  try {
    const platform = os.platform();
    const nearby = [];

    if (platform === 'darwin') {
      const output = await runSafeCommand('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport', ['-s']);
      const lines = output.split('\n').slice(1);
      for (const line of lines) {
        if (!line.trim()) continue;
        const match = line.match(/^\s*(.+?)\s+([0-9a-fA-F:]+)\s+(-?\d+)\s+([\d,+]+)\s+\S+\s+(.+)$/);
        if (match) {
          nearby.push({
            ssid: match[1].trim(),
            bssid: match[2],
            signal: match[3] + ' dBm',
            channel: match[4],
            auth: match[5]
          });
        }
      }
    } else if (platform === 'linux') {
      const output = await runSafeCommand('nmcli', ['-t', '-f', 'ssid,bssid,signal,chan,security', 'dev', 'wifi']);
      const lines = output.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(':');
        nearby.push({
          ssid: parts[0] || 'Desconocido',
          bssid: parts[1] ? parts[1].replace(/\\/g, '') : '?',
          signal: parts[2] ? parts[2] + '%' : '?',
          channel: parts[3] || '?',
          auth: parts[4] || '?'
        });
      }
    } else {
      // Windows
      const output = await runSafeCommand('netsh', ['wlan', 'show', 'networks', 'mode=bssid']);
      const blocks = output.split(/\nSSID\s+\d+\s*:/).slice(1);

      for (const block of blocks) {
        const ssidMatch = block.match(/^(.+)/);
        const authMatch = block.match(/Autenticación\s*:\s*(.+)|Authentication\s*:\s*(.+)/i);
        const signalMatch = block.match(/Señal\s*:\s*(.+)|Signal\s*:\s*(.+)/i);
        const bssidMatch = block.match(/BSSID\s+\d+\s*:\s*(.+)/i);
        const channelMatch = block.match(/Canal\s*:\s*(.+)|Channel\s*:\s*(.+)/i);

        nearby.push({
          ssid: ssidMatch ? ssidMatch[1].trim() : 'Desconocido',
          auth: authMatch ? (authMatch[1] || authMatch[2]).trim() : '?',
          signal: signalMatch ? (signalMatch[1] || signalMatch[2]).trim() : '?',
          bssid: bssidMatch ? bssidMatch[1].trim() : '?',
          channel: channelMatch ? (channelMatch[1] || channelMatch[2]).trim() : '?',
        });
      }
    }

    res.json({ success: true, nearby });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ─── NEW FEATURES ─────────────────────────────────────────────────────────

// API: Listar dispositivos conectados en la misma red (ARP)
app.get('/api/devices', async (req, res) => {
  try {
    const platform = os.platform();
    let output = '';
    const devices = [];

    if (platform === 'win32') {
      output = await runSafeCommand('arp', ['-a']);
      const lines = output.split('\n');
      let currentInterface = '';

      for (const line of lines) {
        const interfaceMatch = line.match(/Interfaz:\s*([\d.]+)/i) || line.match(/Interface:\s*([\d.]+)/i);
        if (interfaceMatch) {
          currentInterface = interfaceMatch[1];
          continue;
        }

        // Match IP and MAC (e.g., 192.168.1.5    00-11-22-33-44-55    dinámico)
        const deviceMatch = line.match(/^\s*([\d.]+)\s+([0-9a-fA-F-]+)\s+(\w+)/i);
        if (deviceMatch) {
          devices.push({
            ip: deviceMatch[1],
            mac: deviceMatch[2],
            type: deviceMatch[3],
            iface: currentInterface
          });
        }
      }
    } else {
      // Basic support for linux/mac
      output = await runSafeCommand('arp', ['-a']);
      const lines = output.split('\n');
      for (const line of lines) {
        // e.g. ? (192.168.1.10) at 00:11:22:33:44:55 ...
        const match = line.match(/\(([\d.]+)\)\s+at\s+([0-9a-fA-F:]+)/i);
        if (match) {
          devices.push({ ip: match[1], mac: match[2], type: 'dynamic', iface: 'unknown' });
        }
      }
    }

    res.json({ success: true, devices });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// API: Borrar perfil de red (Olvidar)
app.post('/api/network/delete', requireLocalOrAuth, async (req, res) => {
  try {
    const { ssid } = req.body;
    if (!ssid || typeof ssid !== 'string' || ssid.length > 256) {
      throw new Error('SSID válido es requerido');
    }

    const platform = os.platform();
    if (platform === 'win32') {
      const output = await runSafeCommand('netsh', ['wlan', 'delete', 'profile', `name=${ssid.trim()}`]);
      if (output.toLowerCase().includes('no se encuentra') || output.toLowerCase().includes('not found')) {
         throw new Error('Perfil no encontrado');
      }
      res.json({ success: true, message: output.trim() });
    } else {
      throw new Error('Función solo implementada en Windows por ahora');
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// API: Conectarse a una nueva red (Generando XML - Solo Windows)
app.post('/api/network/connect', requireLocalOrAuth, async (req, res) => {
  try {
    const { ssid, password } = req.body;
    if (!ssid || typeof ssid !== 'string' || !password || typeof password !== 'string') {
      throw new Error('SSID y password son requeridos');
    }
    const cleanSsid = ssid.trim();
    if (cleanSsid.length > 256 || password.length > 256) {
      throw new Error('Parámetros exceden longitud máxima permitida');
    }

    const platform = os.platform();
    if (platform === 'win32') {
      const hexSsid = Buffer.from(cleanSsid, 'utf8').toString('hex');
      const safeSsidXml = escapeXml(cleanSsid);
      const safePassXml = escapeXml(password);

      const xmlProfile = `<?xml version="1.0"?>
<WLANProfile xmlns="http://www.microsoft.com/networking/WLAN/profile/v1">
	<name>${safeSsidXml}</name>
	<SSIDConfig>
		<SSID>
			<hex>${hexSsid}</hex>
			<name>${safeSsidXml}</name>
		</SSID>
	</SSIDConfig>
	<connectionType>ESS</connectionType>
	<connectionMode>auto</connectionMode>
	<MSM>
		<security>
			<authEncryption>
				<authentication>WPA2PSK</authentication>
				<encryption>AES</encryption>
				<useOneX>false</useOneX>
			</authEncryption>
			<sharedKey>
				<keyType>passPhrase</keyType>
				<protected>false</protected>
				<keyMaterial>${safePassXml}</keyMaterial>
			</sharedKey>
		</security>
	</MSM>
</WLANProfile>`;

      const tempFileName = `wifi_profile_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.xml`;
      const tempPath = path.join(os.tmpdir(), tempFileName);
      fs.writeFileSync(tempPath, xmlProfile, 'utf8');

      try {
        const addOut = await runSafeCommand('netsh', ['wlan', 'add', 'profile', `filename=${tempPath}`]);
        if (addOut.toLowerCase().includes('error')) {
          throw new Error('No se pudo añadir el perfil: ' + addOut);
        }

        await runSafeCommand('netsh', ['wlan', 'connect', `name=${cleanSsid}`]);
        res.json({ success: true, message: 'Intentando conectar...' });
      } finally {
        if (fs.existsSync(tempPath)) {
          try { fs.unlinkSync(tempPath); } catch (_) {}
        }
      }
    } else {
      throw new Error('Función solo implementada en Windows por ahora');
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// API: Diagnósticos rápidos
app.post('/api/diagnostics', requireLocalOrAuth, async (req, res) => {
  try {
    const { action } = req.body;
    const validActions = ['flushdns', 'release', 'renew'];
    if (!action || !validActions.includes(action)) {
      throw new Error('Acción de diagnóstico no soportada o inválida');
    }

    const platform = os.platform();
    let output = '';

    if (platform === 'win32') {
      output = await runSafeCommand('ipconfig', [`/${action}`]);
    } else if (action === 'flushdns' && platform === 'darwin') {
      output = await runSafeCommand('dscacheutil', ['-flushcache']);
    } else {
      throw new Error('Acción de diagnóstico limitada o no soportada en este SO');
    }

    res.json({ success: true, output: output.trim() });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// API: Escáner de puertos TCP
app.post('/api/scan-ports', async (req, res) => {
  try {
    const { ip } = req.body;
    if (!ip || typeof ip !== 'string' || !net.isIP(ip)) {
      throw new Error('Dirección IP inválida');
    }
    const commonPorts = [21, 22, 23, 25, 53, 80, 110, 443, 3306, 3389, 8080];
    const results = [];
    
    // Scan ports sequentially
    for (const port of commonPorts) {
      const resScan = await scanPort(ip, port);
      if (resScan.status === 'open') {
        results.push(port);
      }
    }
    
    res.json({ success: true, openPorts: results });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// API: Monitoreo de tráfico (bytes transmitidos/recibidos)
app.get('/api/traffic', async (req, res) => {
  try {
    const stats = await getNetworkStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ─── SPEED TEST ENDPOINTS ─────────────────────────────────────────────────

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ ts: Date.now() });
});

// Descarga: hace proxy desde Cloudflare → mide velocidad real de internet
app.get('/api/speedtest/download', (req, res) => {
  const bytes = Math.min(parseInt(req.query.bytes, 10) || 25 * 1024 * 1024, 100 * 1024 * 1024);
  const cfUrl = `https://speed.cloudflare.com/__down?bytes=${bytes}`;

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.setHeader('Content-Length', bytes);

  const req2 = https.get(cfUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (cfRes) => {
    cfRes.pipe(res);
  });
  req2.on('error', () => {
    if (!res.headersSent) res.status(502).end();
  });
});

// Subida: recibe datos del cliente y mide throughput
app.post('/api/speedtest/upload', express.raw({ type: '*/*', limit: '50mb' }), (req, res) => {
  res.json({ received: req.body ? req.body.length : 0, ok: true });
});

// ─── DEBUG ENDPOINTS ─────────────────────────────────────────────────────

// API debug: ver perfil crudo de una red
app.get('/api/debug-profile', requireLocalOrAuth, async (req, res) => {
  const name = typeof req.query.name === 'string' ? req.query.name : '';
  const raw = await runSafeCommand('netsh', ['wlan', 'show', 'profile', `name=${name}`, 'key=clear']);
  res.type('text/plain').send(raw);
});

// API debug: ver output crudo de netsh
app.get('/api/debug', requireLocalOrAuth, async (req, res) => {
  const raw = await runSafeCommand('netsh', ['wlan', 'show', 'interfaces']);
  res.type('text/plain').send(raw);
});

const server = app.listen(PORT, HOST, () => {
  console.log(`\n✅ WiFi Manager corriendo en: http://${HOST}:${PORT}`);
  console.log(`💻 Plataforma detectada: ${os.platform()}`);
  if (HOST === '0.0.0.0') {
    console.warn('⚠️ AVISO DE SEGURIDAD: El servidor escucha en 0.0.0.0. Asegúrese de configurar API_KEY si expone la red.');
  }
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
