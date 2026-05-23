/* ─── TRANSLATIONS DICTIONARY ──────────────── */
const translations = {
  es: {
    dashboard: "Panel",
    security: "Seguridad y Canales",
    adv_tools: "Herramientas Pro",
    connected: "Gestión de conexiones y seguridad de red",
    signal: "Señal",
    local_ip: "IP local",
    rx_speed: "Velocidad RX",
    router_panel: "Panel del router",
    actualizar: "Actualizar",
    loading: "Leyendo redes WiFi...",
    qr_title: "Código QR WiFi",
    qr_desc: "Escanea con tu móvil para conectarte",
    cerrar: "Cerrar",
    red_actual: "Red actual",
    sin_wifi: "Sin WiFi activo",
    cable: "Cable",
    saved_nets: "Redes guardadas",
    no_saved: "No se encontraron redes guardadas.",
    nearby_nets: "Redes cercanas detectadas",
    no_nearby: "Sin redes adicionales detectadas.",
    contrasena: "Contraseña",
    conectar: "Conectar",
    ver_qr: "Ver QR",
    olvidar: "Olvidar",
    diagnosticos: "Diagnósticos",
    diag_desc: "Soluciona problemas de conexión comunes.",
    dispositivos: "Dispositivos (LAN)",
    dev_desc: "Detecta quién está en tu red local.",
    escanear_red: "Escanear Red",
    escanear_puertos: "Escanear Puertos",
    puertos_abiertos: "Puertos Abiertos",
    generador_claves: "Generador de Claves",
    gen_desc: "Crea contraseñas seguras de grado militar",
    generar: "Generar",
    seguridad_auditoria: "Auditoría de Seguridad",
    sec_audit_ok: "Tu red es muy segura.",
    sec_audit_warn: "Se detectaron vulnerabilidades posibles.",
    mapa_canales: "Mapa de Canales",
    canales_desc: "Canales WiFi detectados",
    historial: "Historial Reciente",
    borrar: "Borrar",
    iniciar_test: "Iniciar Test",
    listo: "Listo",
    midiendo_ping: "Midiendo ping...",
    ping_listo: "Ping listo",
    descargando: "Descargando...",
    descarga_lista: "Descarga lista",
    subiendo: "Subiendo...",
    subida_lista: "Subida lista",
    test_completado: "Test completado",
    ejecutando_test: "Ejecutando test...",
    repetir_test: "Repetir Test",
    speed_note: "Descarga proxyada desde speed.cloudflare.com · mide tu velocidad real de internet",
    trafico_real: "Tráfico en Tiempo Real",
    trafico_desc: "Monitoreo del uso de banda ancha de tu equipo",
    port_input_lbl: "IP Destino (ej: 192.168.1.1)",
    key_length: "Longitud de clave",
    copied: "¡Copiado!",
  },
  en: {
    dashboard: "Dashboard",
    security: "Security & Channels",
    adv_tools: "Pro Tools",
    connected: "Connection management and network security",
    signal: "Signal",
    local_ip: "Local IP",
    rx_speed: "RX Speed",
    router_panel: "Router panel",
    actualizar: "Refresh",
    loading: "Reading WiFi networks...",
    qr_title: "WiFi QR Code",
    qr_desc: "Scan with your phone to connect",
    cerrar: "Close",
    red_actual: "Current network",
    sin_wifi: "No active WiFi",
    cable: "Cable",
    saved_nets: "Saved networks",
    no_saved: "No saved networks found.",
    nearby_nets: "Detected nearby networks",
    no_nearby: "No additional networks detected.",
    contrasena: "Password",
    conectar: "Connect",
    ver_qr: "Show QR",
    olvidar: "Forget",
    diagnosticos: "Diagnostics",
    diag_desc: "Solve common connection issues.",
    dispositivos: "Devices (LAN)",
    dev_desc: "Detect who is on your local network.",
    escanear_red: "Scan Network",
    escanear_puertos: "Scan Ports",
    puertos_abiertos: "Open Ports",
    generador_claves: "Password Generator",
    gen_desc: "Create military-grade secure passwords",
    generar: "Generate",
    seguridad_auditoria: "Security Audit",
    sec_audit_ok: "Your network is very secure.",
    sec_audit_warn: "Possible vulnerabilities detected.",
    mapa_canales: "Channel Map",
    canales_desc: "Detected WiFi Channels",
    historial: "Recent History",
    borrar: "Clear",
    iniciar_test: "Start Test",
    listo: "Ready",
    midiendo_ping: "Measuring ping...",
    ping_listo: "Ping ready",
    descargando: "Downloading...",
    descarga_lista: "Download ready",
    subiendo: "Uploading...",
    subida_lista: "Upload ready",
    test_completado: "Test completed",
    ejecutando_test: "Running test...",
    repetir_test: "Repeat Test",
    speed_note: "Download proxied from speed.cloudflare.com · measures real internet speed",
    trafico_real: "Real-time Traffic",
    trafico_desc: "Monitor your device bandwidth usage",
    port_input_lbl: "Target IP (e.g. 192.168.1.1)",
    key_length: "Key Length",
    copied: "Copied!",
  }
};

let currentLang = localStorage.getItem('wifiLang') || 'es';
let savedNetworksList = [];
let nearbyNetworksList = [];

/* ─── MULTI-LANGUAGE MANAGEMENT ───────────── */
function applyTranslations(lang) {
  currentLang = lang;
  localStorage.setItem('wifiLang', lang);
  document.getElementById('langSelect').value = lang;
  
  const dict = translations[lang] || translations.es;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Re-render networks and charts to apply language changes
  if (savedNetworksList.length) renderSaved(savedNetworksList);
  if (nearbyNetworksList.length) renderNearby(nearbyNetworksList);
  renderHistoryGraph();
  if (nearbyNetworksList.length) renderChannelsChart(nearbyNetworksList);
  renderSecurityScore(savedNetworksList);
}

/* ─── THEME MANAGEMENT ────────────────────── */
function initTheme() {
  const savedTheme = localStorage.getItem('wifiTheme') || 'dark';
  const body = document.body;
  const toggleBtn = document.getElementById('themeToggle');
  
  if (savedTheme === 'light') {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    toggleBtn.textContent = '☀️';
  } else {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
    toggleBtn.textContent = '🌙';
  }
}

function toggleTheme() {
  const body = document.body;
  const toggleBtn = document.getElementById('themeToggle');
  
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    toggleBtn.textContent = '☀️';
    localStorage.setItem('wifiTheme', 'light');
  } else {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
    toggleBtn.textContent = '🌙';
    localStorage.setItem('wifiTheme', 'dark');
  }

  // Update charts color settings on theme change
  if (nearbyNetworksList.length) renderChannelsChart(nearbyNetworksList);
  renderTrafficChart();
  renderHistoryGraph();
}

/* ─── TAB NAVIGATION SYSTEM ────────────────── */
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Update active button
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update visible content
      contents.forEach(content => {
        if (content.id === targetTab) {
          content.style.display = 'block';
          content.classList.add('active-content');
        } else {
          content.style.display = 'none';
          content.classList.remove('active-content');
        }
      });

      // Actions on switching tabs
      if (targetTab === 'tools-tab') {
        startTrafficMonitoring();
      } else {
        stopTrafficMonitoring();
      }
    });
  });
}

/* ─── UTILITY ─────────────────────────────── */
function getSignalEmoji(signal) {
  if (!signal) return '📶';
  const val = parseInt(signal);
  if (val >= 80) return '📶';
  if (val >= 50) return '📶';
  return '📶';
}

/* ─── TOGGLE PASSWORD ──────────────────────── */
function togglePassword(id, real) {
  const el = document.getElementById('pass-' + id);
  const btn = document.getElementById('eye-' + id);
  const masked = el.classList.contains('masked');

  if (masked) {
    el.textContent = real;
    el.classList.remove('masked');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  } else {
    el.textContent = '••••••••';
    el.classList.add('masked');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
}

/* ─── COPY PASSWORD ────────────────────────── */
async function copyPass(id, text) {
  if (!text) return;
  const btn = document.getElementById('copy-' + id);
  try {
    await navigator.clipboard.writeText(text);
    btn.classList.add('copied');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    }, 2000);
  } catch(e) {}
}

/* ─── RENDER SAVED NETWORKS ────────────────── */
function renderSaved(networks) {
  const list = document.getElementById('savedList');
  document.getElementById('networkCount').textContent = networks.length;
  const dict = translations[currentLang];

  if (!networks.length) {
    list.innerHTML = `<p style="color:var(--text-sub);grid-column:1/-1;text-align:center;padding:2rem;" data-i18n="no_saved">${dict.no_saved}</p>`;
    return;
  }

  list.innerHTML = networks.map((net, i) => {
    const primaryAuth = net.authModes ? net.authModes[0] : net.auth;
    const fallbackModes = net.authModes ? net.authModes.slice(1) : [];

    const isWpa3 = /wpa3/i.test(primaryAuth);
    const isWpa2 = /wpa2/i.test(primaryAuth) && !isWpa3;
    const badgeClass = isWpa3 ? 'badge-wpa3' : isWpa2 ? 'badge-wpa2' : 'badge-open';

    const hasPass = !!net.password;

    // Secondary fallback auth modes
    const fallbackChips = fallbackModes.map(m => {
      const cls = /wpa2/i.test(m) ? 'chip-wpa2' : 'chip-other';
      return `<span class="fallback-chip ${cls}" title="Modo de compatibilidad">↳ ${m}</span>`;
    }).join('');

    return `
      <div class="net-card">
        <div class="net-card-header">
          <div class="net-name">${net.name}</div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem;">
            <span class="badge ${badgeClass}">${primaryAuth}</span>
            ${fallbackChips}
          </div>
        </div>
        <div class="net-meta">
          <span class="net-chip">${net.cipher}</span>
          <span class="net-chip">${net.mode}</span>
        </div>
        <div class="pass-row">
          <span class="pass-label" data-i18n="contrasena">${dict.contrasena}</span>
          <div class="pass-value masked" id="pass-${i}">
            ${hasPass ? '••••••••' : '(sin clave)'}
          </div>
          ${hasPass ? `
          <div class="pass-actions">
            <button class="icon-btn" id="eye-${i}" onclick="togglePassword(${i}, '${net.password.replace(/'/g, "\\'")}')" title="Mostrar/ocultar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="icon-btn" id="copy-${i}" onclick="copyPass(${i}, '${net.password.replace(/'/g, "\\'")}')" title="Copiar clave">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>` : ''}
        </div>
        <div style="display:flex; gap:0.5rem; margin-top:1rem;">
          ${hasPass ? `<button class="btn-tool" style="flex:1" onclick="showQrModal('${net.name.replace(/'/g, "\\'")}', '${net.password.replace(/'/g, "\\'")}', '${primaryAuth}')">${dict.ver_qr}</button>` : ''}
          <button class="btn-tool" style="flex:1; color: var(--danger); border-color: rgba(244,63,94,0.3);" onclick="forgetNetwork('${net.name.replace(/'/g, "\\'")}')">${dict.olvidar}</button>
        </div>
      </div>`;
  }).join('');
}

/* ─── RENDER NEARBY ────────────────────────── */
function renderNearby(nearby) {
  const list = document.getElementById('nearbyList');
  const dict = translations[currentLang];
  
  if (!nearby.length) {
    list.innerHTML = `<p style="color:var(--text-sub);text-align:center;padding:1.5rem;grid-column:1/-1;" data-i18n="no_nearby">${dict.no_nearby}</p>`;
    return;
  }
  
  list.innerHTML = nearby.map(net => `
    <div class="nearby-card" style="flex-direction:column; align-items:stretch;">
      <div style="display:flex; align-items:center; gap:1rem;">
        <div class="signal-icon">📡</div>
        <div class="nearby-info" style="flex:1;">
          <h4 title="${net.ssid}">${net.ssid}</h4>
          <div class="nearby-meta">${net.signal} · ${dict.signal.toLowerCase()} ${net.signal} · ${currentLang === 'es' ? 'Canal' : 'Channel'} ${net.channel} · ${net.auth}</div>
        </div>
      </div>
      <div style="display:flex; gap:0.5rem; margin-top:0.8rem;">
        <input type="password" id="conn-pass-${net.ssid}" placeholder="${dict.contrasena}" style="flex:2; background:var(--surface-2); border:1px solid var(--border); color:var(--text); padding:0.4rem 0.6rem; border-radius:6px; font-size:0.8rem;">
        <button class="btn-tool" style="flex:1; background:var(--primary-glow); border-color:var(--primary); color:white;" onclick="connectNetwork('${net.ssid.replace(/'/g, "\\'")}')">${dict.conectar}</button>
      </div>
    </div>`).join('');
}

/* ─── FETCH & UPDATE ───────────────────────── */
async function fetchData() {
  const loading = document.getElementById('loading');
  loading.style.opacity = '1';
  loading.style.visibility = 'visible';

  try {
    const [netRes, scanRes] = await Promise.all([
      fetch('/api/networks'),
      fetch('/api/scan')
    ]);
    const data = await netRes.json();
    const scan = await scanRes.json();

    if (data.success) {
      // Save data locally
      savedNetworksList = data.networks || [];
      
      const cur = data.currentNetwork;
      const wifiOn = !!cur.ssid;

      const dict = translations[currentLang];
      document.getElementById('currentSsid').textContent    = cur.ssid   || dict.sin_wifi;
      document.getElementById('signalStrength').textContent  = cur.signal || (wifiOn ? '—' : dict.cable);
      document.getElementById('localIp').textContent         = data.localIP || '—';
      document.getElementById('rxSpeed').textContent         = cur.speed  || (wifiOn ? '—' : '—');

      // Visual dimming when no WiFi active
      const ssidEl = document.getElementById('currentSsid');
      ssidEl.style.color = wifiOn ? '' : 'var(--text-sub)';
      ssidEl.style.fontSize = wifiOn ? '' : '0.9rem';

      // Router button
      const wrap = document.getElementById('routerBtnWrap');
      if (data.adminPanels && data.adminPanels.length) {
        const p = data.adminPanels[0];
        const label = cur.ssid || 'Router local';
        wrap.innerHTML = `
          <a href="${p.url}" target="_blank" class="router-btn">
            <div class="router-btn-info">
              <span class="stat-label" data-i18n="router_panel">${dict.router_panel}</span>
              <div class="router-btn-name">${label} <span style="color:var(--text-muted);font-weight:400;font-size:0.8rem;">${p.ip}</span></div>
            </div>
            <div class="router-btn-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </a>`;
      }

      renderSaved(savedNetworksList);
      renderSecurityScore(savedNetworksList);
    }

    if (scan.success) {
      nearbyNetworksList = scan.nearby || [];
      renderNearby(nearbyNetworksList);
      renderChannelsChart(nearbyNetworksList);
    }

  } catch (e) {
    console.error(e);
  } finally {
    loading.style.opacity = '0';
    setTimeout(() => { loading.style.visibility = 'hidden'; }, 400);
  }
}

/* ─── SPEED TEST ────────────────────────────────────────────────────────── */
const CIRC = 2 * Math.PI * 80; // 502.65

function setGauge(fraction, color) {
  const fill = document.getElementById('gaugeFill');
  const offset = CIRC * (1 - Math.min(fraction, 1));
  fill.style.strokeDashoffset = offset;
  if (color) fill.style.stroke = color;
}

function setLive(val, unit, phase) {
  document.getElementById('liveSpeed').textContent =
    typeof val === 'number' ? (val >= 100 ? Math.round(val) : val.toFixed(1)) : val;
  if (unit)  document.getElementById('liveUnit').textContent  = unit;
  if (phase) document.getElementById('livePhase').textContent = phase;
}

function setMetricActive(id)      { document.getElementById(id).className = 'speed-metric active-metric'; }
function setMetricDone(id, val)   {
  const el = document.getElementById(id);
  el.className = 'speed-metric done-metric';
  const v = el.querySelector('.metric-val');
  v.textContent = val;
  v.classList.add('done');
}

/* Ping */
async function runPing() {
  setMetricActive('metricPing');
  const dict = translations[currentLang];
  setLive('—', 'ms', dict.midiendo_ping);
  setGauge(0, '#a78bfa');
  document.getElementById('gaugeFill').classList.add('active');

  const times = [];
  for (let i = 0; i < 6; i++) {
    const t = Date.now();
    await fetch('/api/ping');
    times.push(Date.now() - t);
    await new Promise(r => setTimeout(r, 100));
  }
  times.shift(); // drop first warmup
  const avg = Math.round(times.reduce((a, b) => a + b) / times.length);
  setLive(avg, 'ms', dict.ping_listo);
  setGauge(Math.max(0, 1 - avg / 300), '#a78bfa');
  setMetricDone('metricPing', avg + ' ms');
  return avg;
}

/* Download */
async function runDownload() {
  setMetricActive('metricDown');
  const dict = translations[currentLang];
  setLive(0, 'Mbps', dict.descargando);
  setGauge(0, '#60a5fa');

  const bytes = 25 * 1024 * 1024;
  const start = Date.now();
  let received = 0;
  let lastMbps = 0;

  try {
    const res = await fetch(`/api/speedtest/download?bytes=${bytes}`);
    const reader = res.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.length;
      const elapsed = (Date.now() - start) / 1000;
      lastMbps = (received * 8) / (elapsed * 1e6);
      setLive(lastMbps, 'Mbps', dict.descargando);
      setGauge(Math.min(lastMbps / 200, 1), '#60a5fa');
      document.getElementById('downVal').textContent = lastMbps >= 100
        ? Math.round(lastMbps) : lastMbps.toFixed(1);
    }
  } catch (e) {
    console.error('Download error', e);
  }

  const totalSec = (Date.now() - start) / 1000;
  const finalMbps = (received * 8) / (totalSec * 1e6);
  const display = finalMbps >= 100 ? Math.round(finalMbps) : finalMbps.toFixed(1);
  setLive(display, 'Mbps', dict.descarga_lista);
  setGauge(Math.min(finalMbps / 200, 1), '#60a5fa');
  setMetricDone('metricDown', display + ' Mbps');
  return finalMbps;
}

/* Upload */
async function runUpload() {
  setMetricActive('metricUp');
  const dict = translations[currentLang];
  setLive(0, 'Mbps', dict.subiendo);
  setGauge(0, '#34d399');

  const bytes = 10 * 1024 * 1024; // 10 MB
  const data = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i += 4096) data[i] = Math.random() * 256;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const start = Date.now();

    xhr.upload.addEventListener('progress', (e) => {
      if (!e.lengthComputable) return;
      const elapsed = (Date.now() - start) / 1000;
      const mbps = (e.loaded * 8) / (elapsed * 1e6);
      setLive(mbps, 'Mbps', dict.subiendo);
      setGauge(Math.min(mbps / 100, 1), '#34d399');
      document.getElementById('upVal').textContent = mbps >= 100
        ? Math.round(mbps) : mbps.toFixed(1);
    });

    xhr.onload = () => {
      const elapsed = (Date.now() - start) / 1000;
      const finalMbps = (bytes * 8) / (elapsed * 1e6);
      const display = finalMbps >= 100 ? Math.round(finalMbps) : finalMbps.toFixed(1);
      setLive(display, 'Mbps', dict.subida_lista);
      setGauge(Math.min(finalMbps / 100, 1), '#34d399');
      setMetricDone('metricUp', display + ' Mbps');
      resolve(finalMbps);
    };

    xhr.onerror = () => resolve(0);
    xhr.open('POST', '/api/speedtest/upload');
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.send(data.buffer);
  });
}

/* Main test runner */
async function runSpeedTest() {
  const btn = document.getElementById('startTest');
  const dict = translations[currentLang];
  btn.disabled = true;
  btn.classList.add('running');
  btn.innerHTML = `
    <svg class="spin-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
    ${dict.ejecutando_test}`;

  // Reset metrics
  ['metricPing','metricDown','metricUp'].forEach(id => {
    document.getElementById(id).className = 'speed-metric';
  });
  ['pingVal','downVal','upVal'].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = '—';
    el.classList.remove('done');
  });
  document.getElementById('gaugeFill').classList.add('active');

  try {
    const ping = await runPing();
    await new Promise(r => setTimeout(r, 300));
    const down = await runDownload();
    await new Promise(r => setTimeout(r, 300));
    const up = await runUpload();
    
    // Save to history
    saveTestResult(ping, down, up);
  } finally {
    setLive('✓', '', dict.test_completado);
    setGauge(1, '#06d6a0');
    document.getElementById('gaugeFill').classList.remove('active');
    btn.disabled = false;
    btn.classList.remove('running');
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      ${dict.repetir_test}`;
  }
}

/* ─── NEW FEATURES ────────────────────────────────────────────────────────── */

/* 1. Theme/Language Handlers */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTabs();
  applyTranslations(currentLang);

  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('langSelect').addEventListener('change', (e) => {
    applyTranslations(e.target.value);
  });

  // Start initial fetch
  fetchData();

  // Speed test setup
  const svg = document.querySelector('.gauge-svg');
  if (svg) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#8b5cf6"/>
        <stop offset="100%" stop-color="#06d6a0"/>
      </linearGradient>`;
    svg.prepend(defs);
  }

  document.getElementById('startTest').addEventListener('click', runSpeedTest);
  
  // Port scanner input keypress
  document.getElementById('portScanIp').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') runPortScan();
  });
});

/* 2. QR Modal & Forget/Connect */
let qrCodeInstance = null;

function showQrModal(ssid, password, auth) {
  const modal = document.getElementById('qrModal');
  const wrap = document.getElementById('qrCanvasWrap');
  const label = document.getElementById('qrSsidLabel');
  
  const wifiType = /wpa/i.test(auth) ? 'WPA' : (/wep/i.test(auth) ? 'WEP' : 'nopass');
  const passStr = password && wifiType !== 'nopass' ? `P:${password};` : '';
  const qrString = `WIFI:S:${ssid};T:${wifiType};${passStr};`;

  wrap.innerHTML = '';
  label.textContent = (currentLang === 'es' ? 'Red: ' : 'Network: ') + ssid;
  
  if (window.QRCode) {
    qrCodeInstance = new QRCode(wrap, {
      text: qrString,
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  } else {
    wrap.innerHTML = '<p>Error: QRCode library not loaded</p>';
  }
  
  modal.style.display = 'flex';
}

function closeQrModal() {
  document.getElementById('qrModal').style.display = 'none';
}

async function forgetNetwork(ssid) {
  const question = currentLang === 'es' 
    ? `¿Seguro que quieres borrar (olvidar) la red ${ssid}?`
    : `Are you sure you want to delete (forget) network ${ssid}?`;
  if (!confirm(question)) return;
  try {
    const res = await fetch('/api/network/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ssid })
    });
    const data = await res.json();
    if (data.success) {
      alert(currentLang === 'es' ? 'Red olvidada.' : 'Network forgotten.');
      fetchData();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    alert(currentLang === 'es' ? 'Error de conexión' : 'Connection error');
  }
}

async function connectNetwork(ssid) {
  const passInput = document.getElementById(`conn-pass-${ssid}`);
  const password = passInput ? passInput.value : '';
  if (!password) {
    alert(currentLang === 'es' ? 'Introduce la contraseña para ' + ssid : 'Enter password for ' + ssid);
    return;
  }
  try {
    alert(currentLang === 'es' 
      ? 'Intentando conectar... el sistema puede tardar unos segundos en cambiar de red.'
      : 'Attempting to connect... system may take a few seconds to switch.');
    const res = await fetch('/api/network/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ssid, password })
    });
    const data = await res.json();
    if (data.success) {
      setTimeout(fetchData, 8000); // Check status after 8s
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    console.error(err);
  }
}

/* 3. Diagnostics & Device scan */
async function runDiagnostic(action) {
  const resDiv = document.getElementById('diagResult');
  resDiv.style.display = 'block';
  resDiv.textContent = (currentLang === 'es' ? 'Ejecutando ' : 'Executing ') + action + '...';
  try {
    const res = await fetch('/api/diagnostics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    resDiv.textContent = data.success ? data.output : 'Error: ' + data.error;
  } catch (err) {
    resDiv.textContent = 'Connection error';
  }
}

async function scanDevices() {
  const listDiv = document.getElementById('devicesList');
  listDiv.style.display = 'block';
  listDiv.innerHTML = currentLang === 'es' ? 'Escaneando red local (ARP)...' : 'Scanning local network (ARP)...';
  try {
    const res = await fetch('/api/devices');
    const data = await res.json();
    if (data.success) {
      if (!data.devices || !data.devices.length) {
        listDiv.innerHTML = currentLang === 'es' ? 'No se detectaron dispositivos.' : 'No devices detected.';
        return;
      }
      listDiv.innerHTML = data.devices.map(d => `
        <div class="device-item">
          <span class="device-ip">${d.ip}</span>
          <span class="device-mac">${d.mac} <span style="font-size:0.6rem; color:var(--text-sub);">${d.type}</span></span>
        </div>
      `).join('');
    } else {
      listDiv.innerHTML = 'Error: ' + data.error;
    }
  } catch (err) {
    listDiv.innerHTML = 'Error';
  }
}

/* 4. Port Scanner */
async function runPortScan() {
  const ip = document.getElementById('portScanIp').value.trim();
  if (!ip) {
    alert(currentLang === 'es' ? 'Introduce una dirección IP válida.' : 'Please enter a valid IP address.');
    return;
  }
  const loader = document.getElementById('portScanLoading');
  const resultsDiv = document.getElementById('portScanResults');

  loader.style.display = 'block';
  resultsDiv.style.display = 'none';

  try {
    const res = await fetch('/api/scan-ports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip })
    });
    const data = await res.json();
    loader.style.display = 'none';
    resultsDiv.style.display = 'block';

    if (data.success) {
      if (data.openPorts && data.openPorts.length > 0) {
        resultsDiv.innerHTML = `<span style="font-weight:bold; color:var(--text);">${currentLang === 'es' ? 'Puertos Abiertos Detectados:' : 'Open Ports Detected:'}</span><br><br>` +
          data.openPorts.map(p => `<span style="color:var(--accent); font-weight:bold; background:var(--accent-glow); padding:3px 8px; border-radius:5px; margin:2px; display:inline-block;">PORT ${p}</span>`).join(' ');
      } else {
        resultsDiv.textContent = currentLang === 'es' ? 'No se encontraron puertos abiertos estándar.' : 'No standard open ports found.';
      }
    } else {
      resultsDiv.textContent = 'Error: ' + data.error;
    }
  } catch (err) {
    loader.style.display = 'none';
    resultsDiv.style.display = 'block';
    resultsDiv.textContent = 'Error';
  }
}

/* 5. Password Generator */
function generatePass() {
  const len = parseInt(document.getElementById('passLenRange').value);
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let generated = '';
  for (let i = 0; i < len; i++) {
    generated += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById('generatedPassLabel').textContent = generated;
}

async function copyGeneratedPass() {
  const val = document.getElementById('generatedPassLabel').textContent;
  if (val.startsWith('••')) return;
  try {
    await navigator.clipboard.writeText(val);
    const dict = translations[currentLang];
    alert(dict.copied);
  } catch(e) {}
}

document.getElementById('passLenRange').addEventListener('input', (e) => {
  document.getElementById('passLenVal').textContent = e.target.value;
});

/* 6. Security Score calculation */
function renderSecurityScore(networks) {
  const fill = document.getElementById('secGaugeFill');
  const label = document.getElementById('secScoreVal');
  const textEl = document.getElementById('secAuditResultText');
  const dict = translations[currentLang];

  if (!networks || !networks.length) {
    label.textContent = "100%";
    fill.style.strokeDashoffset = 0;
    fill.style.stroke = '#06d6a0';
    textEl.textContent = dict.sec_audit_ok;
    return;
  }

  let weak = 0;
  networks.forEach(net => {
    const auth = (net.auth || "").toUpperCase();
    if (auth.includes("WEP") || (auth.includes("WPA") && !auth.includes("WPA2") && !auth.includes("WPA3"))) {
      weak++;
    }
    if (net.password && net.password.length < 8) {
      weak++;
    }
  });

  const score = Math.max(0, Math.min(100, Math.round(100 - (weak * (100 / networks.length)))));
  label.textContent = score + "%";
  
  const offset = CIRC * (1 - score / 100);
  fill.style.strokeDashoffset = offset;

  if (score > 80) {
    fill.style.stroke = '#06d6a0';
    textEl.textContent = dict.sec_audit_ok;
  } else {
    fill.style.stroke = '#ef476f';
    textEl.textContent = dict.sec_audit_warn;
  }
}

/* 7. Channel Map (Chart.js) */
let channelsChartInstance = null;

function renderChannelsChart(nearby) {
  const canvas = document.getElementById('channelsChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const counts = {};
  nearby.forEach(net => {
    if (net.channel) {
      const ch = parseInt(net.channel);
      if (ch > 0) counts[ch] = (counts[ch] || 0) + 1;
    }
  });

  const labels = Object.keys(counts).sort((a,b) => a-b);
  const data = labels.map(l => counts[l]);

  if (channelsChartInstance) channelsChartInstance.destroy();

  const isDark = document.body.classList.contains('dark-mode');
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';

  channelsChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.map(l => (currentLang === 'es' ? 'Canal ' : 'Channel ') + l),
      datasets: [{
        data: data,
        backgroundColor: '#8b5cf6',
        borderRadius: 6,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { display: false }
        }
      }
    }
  });
}

/* 8. Traffic Monitoring */
let trafficChartInstance = null;
let trafficHistory = { download: [], upload: [] };
let lastTrafficBytes = { received: 0, sent: 0 };
let trafficIntervalId = null;

function startTrafficMonitoring() {
  if (trafficIntervalId) return;
  lastTrafficBytes = { received: 0, sent: 0 };
  
  trafficIntervalId = setInterval(async () => {
    try {
      const res = await fetch('/api/traffic');
      const data = await res.json();
      if (data.success && data.stats) {
        const rx = data.stats.received;
        const tx = data.stats.sent;
        
        if (lastTrafficBytes.received > 0) {
          // Bytes to Mbps
          const dlSpeed = Math.max(0, ((rx - lastTrafficBytes.received) * 8) / (1024 * 1024));
          const ulSpeed = Math.max(0, ((tx - lastTrafficBytes.sent) * 8) / (1024 * 1024));
          
          trafficHistory.download.push(dlSpeed);
          trafficHistory.upload.push(ulSpeed);
          if (trafficHistory.download.length > 30) {
            trafficHistory.download.shift();
            trafficHistory.upload.shift();
          }
          renderTrafficChart();
        }
        lastTrafficBytes.received = rx;
        lastTrafficBytes.sent = tx;
      }
    } catch (e) {
      console.error('Traffic monitoring error', e);
    }
  }, 1000);
}

function stopTrafficMonitoring() {
  if (trafficIntervalId) {
    clearInterval(trafficIntervalId);
    trafficIntervalId = null;
  }
}

function renderTrafficChart() {
  const canvas = document.getElementById('trafficChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const labels = Array.from({ length: trafficHistory.download.length }, (_, i) => i + 's');

  const isDark = document.body.classList.contains('dark-mode');
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';

  if (trafficChartInstance) trafficChartInstance.destroy();

  trafficChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: currentLang === 'es' ? 'Descarga' : 'Download',
          data: trafficHistory.download,
          borderColor: '#06d6a0',
          backgroundColor: 'rgba(6, 214, 160, 0.05)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 0
        },
        {
          label: currentLang === 'es' ? 'Subida' : 'Upload',
          data: trafficHistory.upload,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { display: false },
          grid: { display: false }
        }
      }
    }
  });
}

/* ─── HISTORY CHART (CHART.JS) ─── */
let historyChart = null;

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('wifiTestHistory') || '[]');
  } catch(e) { return []; }
}

function saveTestResult(ping, down, up) {
  const history = getHistory();
  const now = new Date();
  const timeLabel = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  
  history.push({ time: timeLabel, ping, down, up });
  if (history.length > 10) history.shift();
  
  localStorage.setItem('wifiTestHistory', JSON.stringify(history));
  renderHistoryGraph();
}

function clearHistory() {
  const question = currentLang === 'es' ? '¿Borrar el historial de tests?' : 'Clear speed test history?';
  if (!confirm(question)) return;
  localStorage.removeItem('wifiTestHistory');
  renderHistoryGraph();
}

function renderHistoryGraph() {
  const canvas = document.getElementById('historyChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const history = getHistory();
  
  const labels = history.map(h => h.time);
  const downData = history.map(h => h.down);
  const upData = history.map(h => h.up);

  if (historyChart) historyChart.destroy();

  const isDark = document.body.classList.contains('dark-mode');
  const textColor = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  Chart.defaults.color = textColor;
  Chart.defaults.font.family = "'Inter', sans-serif";

  if (history.length === 0) {
    historyChart = new Chart(ctx, {
      type: 'line',
      data: { labels: [currentLang === 'es' ? 'Sin datos' : 'No data'], datasets: [] },
      options: { responsive: true, plugins: { legend: { display:false } }, scales: { y:{display:false}, x:{display:false} } }
    });
    return;
  }

  historyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: currentLang === 'es' ? 'Descarga (Mbps)' : 'Download (Mbps)',
          data: downData,
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: currentLang === 'es' ? 'Subida (Mbps)' : 'Upload (Mbps)',
          data: upData,
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 6, font: {size: 11} } },
        tooltip: { backgroundColor: isDark ? 'rgba(15, 24, 41, 0.9)' : 'rgba(255, 255, 255, 0.9)', titleColor: isDark ? '#fff' : '#000', padding: 10, borderColor: 'rgba(139, 92, 246, 0.3)', borderWidth: 1 }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: gridColor } },
        x: { grid: { display: false } }
      }
    }
  });
}
