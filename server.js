const express = require('express');
const { exec } = require('child_process');
const https = require('https');
const path = require('path');
const os = require('os');
const net = require('net');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Add JSON body parser

// Ejecutar comando con promesa
function runCommand(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { encoding: 'utf8', maxBuffer: 1024 * 1024 }, (err, stdout) => {
      resolve(stdout || '');
    });
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
    const output = await runCommand('netsh interface ipv4 show subinterfaces');
    console.log("getNetworkStats output length:", output.length);
    const lines = output.split('\n');
    let received = 0;
    let sent = 0;
    for (const line of lines) {
      const match = line.trim().match(/^\d+\s+\d+\s+(\d+)\s+(\d+)\s+(.+)$/);
      if (match) {
        const interfaceName = match[3].toLowerCase();
        if (interfaceName.includes('loopback')) continue;
        received += parseInt(match[1]) || 0;
        sent += parseInt(match[2]) || 0;
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
          received += parseInt(parts[0]) || 0;
          sent += parseInt(parts[8]) || 0;
        }
      }
      return { received, sent };
    } catch (e) {
      return { received: 0, sent: 0 };
    }
  } else if (platform === 'darwin') {
    try {
      const output = await runCommand('netstat -ib -I en0');
      const lines = output.trim().split('\n');
      if (lines.length > 1) {
        const parts = lines[1].trim().split(/\s+/);
        // Column mapping can vary, return placeholder or 0
        return { received: 0, sent: 0 };
      }
    } catch (e) {}
  }
  return { received: 0, sent: 0 };
}


// Obtener gateway (IP del router)
function getDefaultGateway() {
  return new Promise((resolve) => {
    let cmd = 'ipconfig';
    const platform = os.platform();
    if (platform === 'darwin') cmd = 'route -n get default';
    else if (platform === 'linux') cmd = 'ip route show default';

    exec(cmd, { encoding: 'utf8' }, (err, stdout) => {
      if (err) return resolve(null);
      if (platform === 'darwin') {
        const match = stdout.match(/gateway:\s*([\d.]+)/i);
        resolve(match ? match[1] : null);
      } else if (platform === 'linux') {
        const match = stdout.match(/default via\s*([\d.]+)/i);
        resolve(match ? match[1] : null);
      } else {
        const match = stdout.match(/Puerta de enlace predeterminada[.\s]+:\s*([\d.]+)/i)
          || stdout.match(/Default Gateway[.\s]+:\s*([\d.]+)/i);
        resolve(match ? match[1] : null);
      }
    });
  });
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
    const output = await runCommand('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I');
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
    const output = await runCommand('nmcli -t -f active,ssid,signal,bssid,rate dev wifi');
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
    const output = await runCommand('netsh wlan show interfaces');
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
    const output = await runCommand('networksetup -listpreferredwirelessnetworks en0');
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
    const output = await runCommand('nmcli -t -f NAME connection show');
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
    const profilesOutput = await runCommand('netsh wlan show profiles');
    const profileMatches = profilesOutput.matchAll(/Perfil de todos los usuarios\s*:\s*(.+)|All User Profile\s*:\s*(.+)/gi);
    const profiles = [];

    for (const match of profileMatches) {
      const name = (match[1] || match[2]).trim();
      profiles.push(name);
    }

    for (const name of profiles) {
      const safeName = name.replace(/"/g, '\\"');
      const detail = await runCommand(`netsh wlan show profile name="${safeName}" key=clear`);

      const passwordMatch = detail.match(/Contenido de la clave\s*:\s*(.+)|Key Content\s*:\s*(.+)/i);
      const password = passwordMatch ? (passwordMatch[1] || passwordMatch[2]).trim() : null;

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

// API: obtener datos de redes
app.get('/api/networks', async (req, res) => {
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
      const output = await runCommand('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s');
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
      const output = await runCommand('nmcli -t -f ssid,bssid,signal,chan,security dev wifi');
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
      const output = await runCommand('netsh wlan show networks mode=bssid');
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
      output = await runCommand('arp -a');
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
      output = await runCommand('arp -a');
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
app.post('/api/network/delete', async (req, res) => {
  try {
    const { ssid } = req.body;
    if (!ssid) throw new Error('SSID is required');

    const platform = os.platform();
    if (platform === 'win32') {
      const output = await runCommand(`netsh wlan delete profile name="${ssid}"`);
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
app.post('/api/network/connect', async (req, res) => {
  try {
    const { ssid, password } = req.body;
    if (!ssid || !password) throw new Error('SSID y password son requeridos');

    const platform = os.platform();
    if (platform === 'win32') {
      const hexSsid = Buffer.from(ssid, 'utf8').toString('hex');
      const xmlProfile = `<?xml version="1.0"?>
<WLANProfile xmlns="http://www.microsoft.com/networking/WLAN/profile/v1">
	<name>${ssid}</name>
	<SSIDConfig>
		<SSID>
			<hex>${hexSsid}</hex>
			<name>${ssid}</name>
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
				<keyMaterial>${password}</keyMaterial>
			</sharedKey>
		</security>
	</MSM>
</WLANProfile>`;

      const tempPath = path.join(os.tmpdir(), 'wifi_profile.xml');
      fs.writeFileSync(tempPath, xmlProfile, 'utf8');

      const addOut = await runCommand(`netsh wlan add profile filename="${tempPath}"`);
      fs.unlinkSync(tempPath);

      if (addOut.toLowerCase().includes('error')) {
        throw new Error('No se pudo añadir el perfil: ' + addOut);
      }

      const connectOut = await runCommand(`netsh wlan connect name="${ssid}"`);
      res.json({ success: true, message: 'Intentando conectar...' });
    } else {
      throw new Error('Función solo implementada en Windows por ahora');
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// API: Diagnósticos rápidos
app.post('/api/diagnostics', async (req, res) => {
  try {
    const { action } = req.body;
    let cmd = '';
    const platform = os.platform();

    if (platform === 'win32') {
      if (action === 'flushdns') cmd = 'ipconfig /flushdns';
      else if (action === 'release') cmd = 'ipconfig /release';
      else if (action === 'renew') cmd = 'ipconfig /renew';
      else throw new Error('Acción no soportada');
    } else {
      // Very basic unix equivalent for flushdns
      if (action === 'flushdns' && platform === 'darwin') cmd = 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder';
      else throw new Error('Acción de diagnóstico limitada o no soportada en este SO');
    }

    const output = await runCommand(cmd);
    res.json({ success: true, output: output.trim() });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// API: Escáner de puertos TCP
app.post('/api/scan-ports', async (req, res) => {
  try {
    const { ip } = req.body;
    if (!ip) throw new Error('IP is required');
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
  const bytes = Math.min(parseInt(req.query.bytes) || 25 * 1024 * 1024, 100 * 1024 * 1024);
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
app.get('/api/debug-profile', async (req, res) => {
  const name = req.query.name || '';
  const raw = await runCommand(`netsh wlan show profile name="${name.replace(/"/g,'\\"')}" key=clear`);
  res.type('text/plain').send(raw);
});

// API debug: ver output crudo de netsh
app.get('/api/debug', async (req, res) => {
  const raw = await runCommand('netsh wlan show interfaces');
  res.type('text/plain').send(raw);
});

const server = app.listen(PORT, () => {
  console.log(`\n✅ WiFi Manager corriendo en: http://localhost:${PORT}`);
  console.log(`💻 Plataforma detectada: ${os.platform()}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
