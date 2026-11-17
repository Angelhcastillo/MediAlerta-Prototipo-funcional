/* MediAlerta — prototipo de la Solemne 2. Datos de demostración, sin diagnóstico. */
const KEY = "medialerta.v1";
const COLORS = ["#6D3FDB", "#E0567A", "#2F5BD3", "#1F9D6B", "#E39A2D"];

const ui = {
  menu: false,
  sheet: null,
  addingProfile: false,
  alarmId: null,
  toast: "",
  notice: null,
  scan: "idle",
  scanMsg: "",
  scanRaw: "",
  scanFound: null,
  prefill: null,
  formError: "",
  justId: "",
};
let pickedFormat = "pastilla";
let state = load();
let toastTimer = 0;
let noticeTimer = 0;
let scanTimer = 0;
let cameraStream = null;
let facing = "environment";
let ocrWorker = null;

function svg(body) {
  return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
const ICON = {
  bell: svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  x: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
  chev: svg('<path d="m6 9 6 6 6-6"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>'),
  users: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'),
  pill: svg('<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>'),
  bottle: svg('<path d="M10 3h4v3h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V3z"/>'),
  drops: svg('<path d="M12 2s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>'),
  food: svg('<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>'),
  mic: svg('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>'),
  box: svg('<path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>'),
  scan: svg('<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>'),
  cal: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
  cam: svg('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>'),
  image: svg('<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>'),
  alert: svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>'),
  speaker: svg('<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>'),
  undo: svg('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  flip: svg('<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>'),
};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => {
    if (c === "&") return "&" + "amp;";
    if (c === "<") return "&" + "lt;";
    if (c === ">") return "&" + "gt;";
    if (c === '"') return "&" + "quot;";
    return "&" + "#39;";
  });
}
function todayStr(d = new Date()) {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
function fechaLarga(d = new Date()) {
  return d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
}
function clock() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function initial(name) {
  const part = String(name).replace(/^\(|\)$/g, "").trim().split(/\s+/)[0] || "?";
  return part.charAt(0).toUpperCase();
}
function slots(start, every) {
  const [h, m] = String(start || "08:00").split(":").map(Number);
  const step = Number(every) || 8;
  const out = [];
  for (let i = 0; i < 24; i += step) {
    const mins = (((h * 60 + m) + i * 60) % (24 * 60) + 24 * 60) % (24 * 60);
    out.push(`${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`);
  }
  return out;
}
function sortKey(hora) {
  const h = Number(hora.slice(0, 2));
  const m = Number(hora.slice(3));
  return (h < 5 ? h + 24 : h) * 60 + m;
}
function sectionOf(hora) {
  const h = Number(hora.slice(0, 2));
  if (h >= 5 && h < 12) return "MAÑANA";
  if (h >= 12 && h < 19) return "TARDE";
  return "NOCHE";
}
function dueDate(hora, now = new Date()) {
  const [hh, mm] = hora.split(":").map(Number);
  const due = new Date(now);
  due.setHours(hh, mm, 0, 0);
  if (hh < 5 && now.getHours() >= 5) due.setDate(due.getDate() + 1);
  return due;
}
function isOverdue(d, now = new Date()) {
  if (d.estado === "tomada" || d.estado === "omitida") return false;
  return now.getTime() - dueDate(d.hora, now).getTime() > 30 * 60 * 1000;
}
function viewEstado(d) {
  if (d.estado === "tomada" || d.estado === "omitida") return d.estado;
  if (d.estado === "atrasada" || isOverdue(d)) return "atrasada";
  return "pendiente";
}

function seed() {
  const day = todayStr();
  const viewer = { nombre: "Demo Estudiante", correo: "demo@unab.cl", rol: "cuidador" };
  const profiles = [
    { id: "carlos", nombre: "Carlos", grupo: "Adulto Mayor", edad: 72, etiqueta: "Tratamiento Temporal", nota: "Receta por infección respiratoria (7 días)", cuidador: "Demo Estudiante", rol: "paciente", color: "#6D3FDB" },
    { id: "carmen", nombre: "Abuela Carmen", grupo: "Adulto Mayor", edad: 76, etiqueta: "Adulto Mayor (Crónico)", nota: "Tratamiento continuo para hipertensión", cuidador: "Demo Estudiante", rol: "familiar", color: "#2F5BD3" },
    { id: "jorge", nombre: "Abuelo Jorge", grupo: "Abuelo", edad: 81, etiqueta: "Control Metabólico", nota: "Control metabólico", cuidador: "Juan Soto", rol: "familiar", color: "#15246B" },
  ];
  const meds = [
    { id: "amox", perfilId: "carlos", nombre: "Amoxicilina + Ác. Clavulánico", dosis: "875/125 mg", formato: "capsula", frecuenciaHoras: 8, horarios: ["08:00", "16:00", "00:00"], instruccion: "con-comida", duracionDias: 7, stock: 5, stockTotal: 21, umbralStockBajo: 5, color: "#6D3FDB", nota: "Tratamiento de 7 días. Tomar con alimentos." },
    { id: "ibu", perfilId: "carlos", nombre: "Ibuprofeno", dosis: "400 mg", formato: "pastilla", frecuenciaHoras: 8, horarios: ["09:00", "17:00"], instruccion: "con-comida", duracionDias: 7, stock: 14, stockTotal: 20, umbralStockBajo: 5, color: "#E0567A", nota: "Tomar con alimentos." },
    { id: "los", perfilId: "carmen", nombre: "Losartán", dosis: "50 mg", formato: "pastilla", frecuenciaHoras: 12, horarios: ["08:00", "20:00"], instruccion: "", duracionDias: null, stock: 28, stockTotal: 30, umbralStockBajo: 5, color: "#2F5BD3", nota: "Tratamiento continuo para hipertensión." },
    { id: "met", perfilId: "jorge", nombre: "Metformina", dosis: "850 mg", formato: "pastilla", frecuenciaHoras: 12, horarios: ["08:00", "20:00"], instruccion: "con-comida", duracionDias: null, stock: 40, stockTotal: 60, umbralStockBajo: 5, color: "#1F9D6B", nota: "Con el desayuno y la cena." },
    { id: "ome", perfilId: "jorge", nombre: "Omeprazol", dosis: "20 mg", formato: "capsula", frecuenciaHoras: 24, horarios: ["07:30"], instruccion: "ayunas", duracionDias: null, stock: 20, stockTotal: 28, umbralStockBajo: 5, color: "#E39A2D", nota: "En ayunas." },
  ];
  const plan = [
    ["amox", "08:00", "tomada"], ["amox", "16:00", "pendiente"], ["amox", "00:00", "pendiente"],
    ["ibu", "09:00", "tomada"], ["ibu", "17:00", "pendiente"],
    ["los", "08:00", "tomada"], ["los", "20:00", "pendiente"],
    ["met", "08:00", "tomada"], ["met", "20:00", "pendiente"],
    ["ome", "07:30", "tomada"],
  ];
  const doses = plan.map(([medId, hora, estado]) => {
    const m = meds.find((x) => x.id === medId);
    return { id: `${medId}-${day}-${hora}`, medicamentoId: medId, perfilId: m.perfilId, fecha: day, hora, estado, confirmadaEn: estado === "tomada" ? new Date().toISOString() : null, alertaEnviada: false };
  });
  return { version: 1, activeProfileId: "carlos", largeText: false, viewer, profiles, meds, doses, alerts: [], events: [] };
}
function ensureToday(data) {
  const day = todayStr();
  if (data.doses.some((d) => d.fecha === day)) {
    data.doses = data.doses.filter((d) => d.fecha === day);
    return data;
  }
  data.doses = data.meds.flatMap((m) => m.horarios.map((hora) => ({
    id: `${m.id}-${day}-${hora}`, medicamentoId: m.id, perfilId: m.perfilId, fecha: day, hora, estado: "pendiente", confirmadaEn: null, alertaEnviada: false,
  })));
  return data;
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const data = JSON.parse(raw);
    if (!data || data.version !== 1 || !Array.isArray(data.meds)) return seed();
    return normalize(data);
  } catch {
    return seed();
  }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* prototipo local */ }
}
function logEvent(text) {
  state.events.unshift({ t: clock(), text });
  state.events = state.events.slice(0, 30);
}
function active() {
  return state.profiles.find((p) => p.id === state.activeProfileId) || state.profiles[0];
}
function medsOf(pid) { return state.meds.filter((m) => m.perfilId === pid); }
function medById(id) { return state.meds.find((m) => m.id === id); }
function dosesOf(pid) {
  const day = todayStr();
  return state.doses.filter((d) => d.perfilId === pid && d.fecha === day);
}
function lowMeds(pid) { return medsOf(pid).filter((m) => m.stock <= (m.umbralStockBajo ?? 5)); }
function nextDose(list) {
  const open = list.filter((d) => d.estado !== "tomada" && d.estado !== "omitida");
  open.sort((a, b) => dueDate(a.hora) - dueDate(b.hora));
  return open[0] || null;
}
function shortName(p) { return String(p.nombre).replace(/\s*\([^)]*\)\s*$/, ""); }
function fold(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function defaultViewer() {
  return { nombre: "Demo Estudiante", correo: "demo@unab.cl", rol: "cuidador" };
}
function normalize(data) {
  if (!data.viewer || !data.viewer.nombre) data.viewer = defaultViewer();
  (data.profiles || []).forEach((p) => {
    p.nombre = String(p.nombre || "").replace(/\s*\(yo\)\s*/ig, " ").replace(/\s+/g, " ").trim();
    if (!p.rol) {
      const n = fold(`${p.nombre} ${p.grupo || ""}`);
      p.rol = /abuel|familiar|mama|papa|madre|padre|hijo|hija|tio|tia/.test(n) ? "familiar" : "paciente";
    }
    if (!p.cuidador) p.cuidador = data.viewer.nombre;
  });
  return ensureToday(data);
}
function viewer() { return state.viewer || defaultViewer(); }
function isCare() { return state.vista !== "paciente"; }
function titular() {
  return state.profiles.find((p) => p.rol === "paciente") || state.profiles[0];
}
function enterAs(vista) {
  state.vista = vista === "paciente" ? "paciente" : "cuidador";
  ui.menu = false;
  ui.sheet = null;
  if (state.vista === "paciente") state.activeProfileId = titular().id;
  save();
  go(state.vista === "paciente" ? "hoy" : "familia");
}
function rolLabel(p) { return p && p.rol === "familiar" ? "Familiar" : "Paciente"; }
function caresYou(p) { return fold(p.cuidador) === fold(viewer().nombre); }
function carePhrase(p) { return caresYou(p) ? "Lo cuidas tú" : `Cuidador: ${p.cuidador}`; }
function linea(p) { return `${rolLabel(p)} · ${p.edad} años · ${carePhrase(p)}`; }
function unit(fmt) {
  return { pastilla: "comprimido", capsula: "cápsula", jarabe: "jarabe", gotas: "gotas" }[fmt] || "dosis";
}
function instruccionTxt(m) {
  if (m.instruccion === "con-comida") return "Con comida";
  if (m.instruccion === "ayunas") return "En ayunas";
  return "";
}
function daysLeft(m) {
  return Math.max(0, Math.floor(m.stock / Math.max(1, m.horarios.length)));
}
function currentRoute() {
  const path = (location.hash || "#/inicio").replace(/^#/, "").split("?")[0];
  if (path.startsWith("/familia")) return "familia";
  if (path.startsWith("/hoy")) return "hoy";
  if (path.startsWith("/pastillero")) return "pastillero";
  if (path.startsWith("/escanear")) return "escanear";
  return "inicio";
}
function go(route) {
  const next = `#/${route}`;
  if (location.hash === next) render();
  else location.hash = next;
}
function flash(msg) {
  ui.toast = msg;
  render();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { ui.toast = ""; ui.justId = ""; render(); }, 2200);
}
function showNotice(msg) {
  ui.notice = msg;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { ui.notice = null; render(); }, 7000);
}
function speak(text) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-CL";
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    o.start();
    o.frequency.setValueAtTime(660, ctx.currentTime + 0.18);
    o.stop(ctx.currentTime + 0.45);
  } catch { /* sin audio */ }
}
function stopCamera() {
  if (!cameraStream) return;
  cameraStream.getTracks().forEach((t) => t.stop());
  cameraStream = null;
}
async function enableCamera() {
  stopCamera();
  if (!navigator.mediaDevices?.getUserMedia) return;
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
    const video = document.querySelector(".finder video");
    if (video) {
      video.srcObject = cameraStream;
      await video.play();
    }
  } catch { /* visor oscuro si no hay permiso */ }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.Tesseract) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script"));
    document.head.appendChild(s);
  });
}
function setScanStatus(msg) {
  ui.scanMsg = msg;
  const el = document.getElementById("scan-status");
  if (el) el.textContent = msg;
}
async function getWorker() {
  if (!window.Tesseract) {
    setScanStatus("Descargando el lector…");
    await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js");
  }
  if (!window.Tesseract) throw new Error("sin lector");
  if (ocrWorker) return ocrWorker;
  ocrWorker = await window.Tesseract.createWorker("spa", 1, {
    logger(m) {
      if (!m || !m.status) return;
      if (m.status === "recognizing text") setScanStatus(`Leyendo la receta… ${Math.round((m.progress || 0) * 100)}%`);
      else if (String(m.status).includes("language")) setScanStatus("Descargando el idioma español…");
      else setScanStatus("Preparando el lector…");
    },
  });
  return ocrWorker;
}
const KNOWN_MEDS = [
  ["amoxicilina", "clavulan", "Amoxicilina + Ác. clavulánico"],
  ["amoxicilina", "Amoxicilina"],
  ["acido clavulanico", "Ácido clavulánico"],
  ["ibuprofeno", "Ibuprofeno"],
  ["paracetamol", "Paracetamol"],
  ["acetaminofen", "Paracetamol"],
  ["losartan", "Losartán"],
  ["metformina", "Metformina"],
  ["omeprazol", "Omeprazol"],
  ["pantoprazol", "Pantoprazol"],
  ["atorvastatina", "Atorvastatina"],
  ["rosuvastatina", "Rosuvastatina"],
  ["simvastatina", "Simvastatina"],
  ["enalapril", "Enalapril"],
  ["amlodipino", "Amlodipino"],
  ["hidroclorotiazida", "Hidroclorotiazida"],
  ["furosemida", "Furosemida"],
  ["espironolactona", "Espironolactona"],
  ["levotiroxina", "Levotiroxina"],
  ["salbutamol", "Salbutamol"],
  ["loratadina", "Loratadina"],
  ["cetirizina", "Cetirizina"],
  ["azitromicina", "Azitromicina"],
  ["diclofenaco", "Diclofenaco"],
  ["naproxeno", "Naproxeno"],
  ["ketorolaco", "Ketorolaco"],
  ["clonazepam", "Clonazepam"],
  ["sertralina", "Sertralina"],
  ["fluoxetina", "Fluoxetina"],
  ["prednisona", "Prednisona"],
  ["metoprolol", "Metoprolol"],
  ["carvedilol", "Carvedilol"],
  ["warfarina", "Warfarina"],
  ["acido acetilsalicilico", "Ácido acetilsalicílico"],
  ["aspirina", "Aspirina"],
  ["insulina", "Insulina"],
  ["glibenclamida", "Glibenclamida"],
  ["sitagliptina", "Sitagliptina"],
  ["empagliflozina", "Empagliflozina"],
  ["acido folico", "Ácido fólico"],
  ["tramadol", "Tramadol"],
  ["clorfenamina", "Clorfenamina"],
  ["ambroxol", "Ambroxol"],
  ["domperidona", "Domperidona"],
  ["ranitidina", "Ranitidina"],
  ["captopril", "Captopril"],
  ["atenolol", "Atenolol"],
  ["pregabalina", "Pregabalina"],
  ["gabapentina", "Gabapentina"],
  ["alprazolam", "Alprazolam"],
  ["cefalexina", "Cefalexina"],
  ["ciprofloxacino", "Ciprofloxacino"],
  ["metoclopramida", "Metoclopramida"],
];
function parseReceta(text) {
  const raw = String(text || "");
  const plain = fold(raw);
  let nombre = "";
  for (const row of KNOWN_MEDS) {
    if (row.length === 3) {
      if (plain.includes(row[0]) && plain.includes(row[1])) { nombre = row[2]; break; }
    } else if (plain.includes(row[0])) { nombre = row[1]; break; }
  }
  const dose = raw.match(/(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)?)\s*(mg|mcg|µg|ug|g|ml|ui|%)\b/i);
  const dosis = dose ? `${dose[1].replace(/\s+/g, "")} ${dose[2]}` : "";
  let freq = "";
  const cada = plain.match(/cada\s*(\d{1,2})\s*(?:horas|hora|hrs|hr|h)\b/) || plain.match(/\bc\s*\/\s*(\d{1,2})\s*h\b/);
  if (cada) freq = String(Math.min(24, Math.max(1, Number(cada[1]))));
  if (!freq) {
    const veces = plain.match(/(\d)\s*(?:vez|veces)\s*(?:al|por)\s*dia/);
    const map = { 1: "24", 2: "12", 3: "8", 4: "6", 6: "4" };
    if (veces && map[veces[1]]) freq = map[veces[1]];
  }
  if (!freq && /una vez al dia|cada dia|diari[oa]/.test(plain)) freq = "24";
  const diasM = plain.match(/(?:por|durante|x)\s*(\d{1,3})\s*dias?\b/) || plain.match(/\b(\d{1,2})\s*dias?\b/);
  const dias = diasM ? String(Math.min(365, Number(diasM[1]))) : "";
  const comida = /con alimentos|con comida|junto con|despues de comer/.test(plain);
  const ayunas = /ayunas/.test(plain);
  let formato = "pastilla";
  if (/capsul/.test(plain)) formato = "capsula";
  else if (/gotas/.test(plain)) formato = "gotas";
  else if (/jarabe|suspension|solucion oral/.test(plain)) formato = "jarabe";
  const horaM = raw.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  const hora = horaM ? `${horaM[1].padStart(2, "0")}:${horaM[2]}` : "08:00";
  const perDay = freq ? Math.max(1, Math.round(24 / Number(freq))) : 0;
  const stock = dias && perDay ? String(Number(dias) * perDay) : "";
  const notes = [];
  if (!freq) notes.push("No leí la frecuencia: quedó cada 8 h para que la revises.");
  if (ayunas) notes.push("Parece indicado en ayunas.");
  if (!nombre) notes.push("No reconocí el nombre. Complétalo a mano.");
  return { nombre, dosis, freq: freq || "8", hora, dias, stock, comida, formato, nota: notes.join(" "), ok: !!nombre };
}
function frameBlob(video) {
  const max = 1600;
  const scale = Math.min(1, max / Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
}
async function recognize(image) {
  ui.scan = "scanning";
  ui.scanFound = null;
  ui.scanRaw = "";
  ui.scanMsg = ui.scanMsg || "Leyendo la receta…";
  if (!document.getElementById("scan-status")) render();
  try {
    const worker = await getWorker();
    setScanStatus("Leyendo la receta…");
    const { data } = await worker.recognize(image);
    const text = (data && data.text) || "";
    ui.scanFound = parseReceta(text);
    ui.scanRaw = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, 420);
    ui.scan = "result";
    ui.scanMsg = "";
  } catch (err) {
    console.error(err);
    ui.scan = "error";
    ui.scanMsg = "No se pudo leer el texto. Revisa tu conexión y prueba con una foto más nítida y con luz.";
  }
  render();
}
async function captureAndScan() {
  ui.scan = "scanning";
  ui.scanMsg = "Abriendo la cámara…";
  ui.scanFound = null;
  ui.scanRaw = "";
  render();
  if (!cameraStream) await enableCamera();
  const video = document.querySelector(".finder video");
  if (video && video.srcObject && !video.videoWidth) {
    await new Promise((res) => {
      video.addEventListener("loadeddata", () => res(), { once: true });
      setTimeout(res, 1400);
    });
  }
  if (!video || !video.videoWidth) {
    ui.scan = "error";
    ui.scanMsg = "No pude usar la cámara. Sube una foto de la receta o de la caja.";
    render();
    return;
  }
  const blob = await frameBlob(video);
  if (!blob) {
    ui.scan = "error";
    ui.scanMsg = "No pude capturar la imagen. Intenta de nuevo o sube una foto.";
    render();
    return;
  }
  ui.scanMsg = "Leyendo la receta…";
  await recognize(blob);
}
async function scanFile(file) {
  if (!file) return;
  ui.scan = "scanning";
  ui.scanMsg = "Leyendo la imagen…";
  ui.scanFound = null;
  ui.scanRaw = "";
  render();
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  await recognize(dataUrl);
}

function fireAlarm(doseId) {
  const list = dosesOf(active().id);
  const d = state.doses.find((x) => x.id === doseId) || nextDose(list);
  if (!d || d.estado === "tomada") { flash("No hay tomas pendientes"); return; }
  const m = medById(d.medicamentoId);
  const p = state.profiles.find((x) => x.id === d.perfilId) || active();
  ui.alarmId = d.id;
  ui.menu = false;
  logEvent(`Recordatorio enviado · ${m.nombre} ${d.hora}`);
  save();
  render();
  beep();
  navigator.vibrate?.([200, 100, 200, 100, 200]);
  const extra = m.instruccion === "con-comida" ? ", con comida" : m.instruccion === "ayunas" ? ", en ayunas" : "";
  const said = isCare()
    ? `Aviso para ${shortName(p)}. Es hora de ${m.nombre}, ${m.dosis}${extra}.`
    : `${shortName(p)}, es hora de tomar ${m.nombre}, ${m.dosis}${extra}.`;
  speak(said);
}
function take(id) {
  const d = state.doses.find((x) => x.id === id);
  if (!d || d.estado === "tomada") return;
  const m = medById(d.medicamentoId);
  d.estado = "tomada";
  d.confirmadaEn = new Date().toISOString();
  if (m && m.stock > 0) m.stock -= 1;
  ui.alarmId = null;
  ui.justId = id;
  logEvent(`Dosis confirmada · ${m ? m.nombre : "Medicamento"} ${d.hora}`);
  save();
  flash(isCare() ? `Confirmada la toma de ${shortName(active())}` : "Listo. Quedó registrada tu toma");
}
function undo(id) {
  const d = state.doses.find((x) => x.id === id);
  if (!d || d.estado !== "tomada") return;
  const m = medById(d.medicamentoId);
  d.estado = "pendiente";
  d.confirmadaEn = null;
  if (m) {
    m.stock += 1;
    m.stockTotal = Math.max(m.stockTotal, m.stock);
  }
  logEvent(`Dosis deshecha · ${m ? m.nombre : "Medicamento"} ${d.hora}`);
  save();
  render();
}
function simulateMiss() {
  const p = active();
  const d = nextDose(dosesOf(p.id));
  if (!d) { flash("No hay tomas pendientes"); return; }
  const m = medById(d.medicamentoId);
  d.estado = "atrasada";
  d.alertaEnviada = true;
  const msg = isCare()
    ? `${shortName(p)} no ha confirmado ${m.nombre} de las ${d.hora}. La alerta te llega a ti, ${viewer().nombre}.`
    : `No confirmaste ${m.nombre} de las ${d.hora}. Avisamos a tu cuidador ${p.cuidador}.`;
  state.alerts.unshift({ id: `a${Date.now()}`, perfilId: p.id, tomaId: d.id, tipo: "familiar", mensaje: msg, creadaEn: new Date().toISOString(), resuelta: false });
  logEvent(`Alerta a cuidador · ${m.nombre} ${d.hora}`);
  save();
  showNotice(msg);
  render();
  speak(msg);
}
function forceLow() {
  const list = medsOf(active().id);
  if (!list.length) { flash("Este perfil no tiene medicamentos"); return; }
  const m = list[0];
  m.stock = 3;
  m.umbralStockBajo = Math.max(m.umbralStockBajo || 5, 5);
  logEvent(`Stock bajo forzado · ${m.nombre}`);
  save();
  flash("Stock bajo forzado");
}
function changeStock(id, op) {
  const m = medById(id);
  if (!m) return;
  if (op === -1) m.stock = Math.max(0, m.stock - 1);
  if (op === 1 || op === 30) {
    m.stock += op;
    m.stockTotal = Math.max(m.stockTotal, m.stock);
  }
  logEvent(`${m.nombre}: quedan ${m.stock}`);
  save();
  render();
}
function resetDemo() {
  state = seed();
  save();
  ui.sheet = null;
  ui.menu = false;
  ui.alarmId = null;
  ui.notice = null;
  ui.scan = "idle";
  ui.scanMsg = "";
  ui.scanRaw = "";
  ui.scanFound = null;
  ui.addingProfile = false;
  stopCamera();
  flash("Demo reiniciada");
}
function openMed(prefill) {
  ui.prefill = prefill || null;
  pickedFormat = prefill?.formato || "pastilla";
  ui.sheet = "med";
  ui.formError = "";
  ui.menu = false;
  render();
}
function saveMed() {
  const nombre = document.getElementById("f-nombre")?.value.trim() || "";
  const err = document.getElementById("f-error");
  if (!nombre) {
    if (err) err.textContent = "El nombre del medicamento es obligatorio.";
    return;
  }
  const perfilId = document.getElementById("f-perfil").value;
  const dosis = document.getElementById("f-dosis").value.trim() || "1 dosis";
  const freq = Number(document.getElementById("f-freq").value);
  const hora = document.getElementById("f-hora").value || "08:00";
  const comida = document.getElementById("f-comida").checked;
  const diasRaw = document.getElementById("f-dias").value;
  const stock = Math.max(0, Number(document.getElementById("f-stock").value || 30));
  const horarios = slots(hora, freq);
  const id = `m${Date.now()}`;
  const med = {
    id, perfilId, nombre, dosis, formato: pickedFormat, frecuenciaHoras: freq, horarios,
    instruccion: comida ? "con-comida" : "",
    duracionDias: diasRaw ? Number(diasRaw) : null,
    stock, stockTotal: Math.max(stock, 1), umbralStockBajo: 5,
    color: COLORS[state.meds.length % COLORS.length],
    nota: [diasRaw ? `Tratamiento de ${diasRaw} días.` : "", comida ? "Tomar con alimentos." : ""].filter(Boolean).join(" "),
  };
  state.meds.push(med);
  const day = todayStr();
  horarios.forEach((h) => {
    state.doses.push({ id: `${id}-${day}-${h}`, medicamentoId: id, perfilId, fecha: day, hora: h, estado: "pendiente", confirmadaEn: null, alertaEnviada: false });
  });
  logEvent(`Medicamento agregado · ${nombre}`);
  ui.sheet = null;
  ui.prefill = null;
  save();
  if (currentRoute() === "escanear") go("hoy");
  flash("Medicamento agregado");
}
function saveProfile() {
  const nombre = document.getElementById("p-nombre")?.value.trim() || "";
  const consent = document.getElementById("p-consent")?.checked;
  const err = document.getElementById("p-error");
  if (!nombre) { if (err) err.textContent = "Escribe el nombre."; return; }
  if (!consent) { if (err) err.textContent = "Necesitas confirmar la autorización."; return; }
  const edad = Math.max(0, Number(document.getElementById("p-edad").value || 70));
  const tipo = document.getElementById("p-tipo").value;
  const rol = document.getElementById("p-rol")?.value === "familiar" ? "familiar" : "paciente";
  const cuidador = document.getElementById("p-cuidador").value.trim() || viewer().nombre;
  const id = `p${Date.now()}`;
  state.profiles.push({ id, nombre, grupo: tipo, edad, etiqueta: tipo, nota: "Perfil agregado en la demo", cuidador, rol, color: COLORS[state.profiles.length % COLORS.length] });
  state.activeProfileId = id;
  ui.addingProfile = false;
  ui.sheet = null;
  logEvent(`Perfil agregado · ${nombre}`);
  save();
  flash("Perfil agregado");
}
function refreshSlots() {
  const hora = document.getElementById("f-hora");
  const freq = document.getElementById("f-freq");
  const el = document.getElementById("f-slots");
  if (!hora || !freq || !el) return;
  el.innerHTML = slots(hora.value, freq.value).map((h) => `<span class="chip">${esc(h)}</span>`).join("");
}

function doseCard(d) {
  const m = medById(d.medicamentoId);
  if (!m) return "";
  const st = viewEstado(d);
  const food = instruccionTxt(m);
  const late = st === "atrasada";
  const done = st === "tomada";
  let action = `<button type="button" class="btn-take" data-act="take" data-id="${esc(d.id)}">${ICON.check} ${isCare() ? "Confirmar" : "Ya la tomé"}</button>`;
  if (done) {
    action = `<div class="done-row"><span class="chip-ok">${ICON.check} Listo</span><button type="button" class="undo" data-act="undo" data-id="${esc(d.id)}" aria-label="Deshacer toma">${ICON.undo}</button></div>`;
  } else if (late) {
    action = `<button type="button" class="btn-take" data-act="take" data-id="${esc(d.id)}">${isCare() ? "Confirmar" : "Tomar ahora"}</button>`;
  }
  const p = state.profiles.find((x) => x.id === d.perfilId);
  return `<article class="dose ${done ? "done" : ""} ${late ? "late" : ""} ${ui.justId === d.id ? "pop" : ""}">
    <div class="med-ico" style="background:${esc(m.color)}">${ICON.pill}</div>
    <div style="min-width:0">
      <h3>${esc(m.nombre)}</h3>
      <p class="sub">${esc(m.dosis)} (1 ${esc(unit(m.formato))})</p>
      ${food ? `<p class="food">${ICON.food} ${esc(food)}</p>` : ""}
      ${d.alertaEnviada ? `<p class="late-note">${isCare() ? `Aviso para ti, ${esc(viewer().nombre)}` : `Aviso enviado a ${esc(p ? p.cuidador : "tu cuidador")}`}</p>` : ""}
    </div>
    <div class="side">
      <span class="time ${late ? "bad" : ""}">${late ? `Atrasada · ${esc(d.hora)}` : esc(d.hora)}</span>
      ${action}
    </div>
  </article>`;
}
function screenHoy() {
  const p = active();
  const list = dosesOf(p.id).slice().sort((a, b) => sortKey(a.hora) - sortKey(b.hora));
  const tomadas = list.filter((d) => d.estado === "tomada").length;
  const pend = list.length - tomadas;
  const next = nextDose(list);
  const nm = next ? medById(next.medicamentoId) : null;
  const late = next ? viewEstado(next) === "atrasada" : false;
  const groups = ["MAÑANA", "TARDE", "NOCHE"].map((name) => {
    const items = list.filter((d) => sectionOf(d.hora) === name);
    if (!items.length) return "";
    return `<h2 class="sec">${name}</h2>${items.map(doseCard).join("")}`;
  }).join("");
  return `<div class="pad">
    <div class="sum"><span>${isCare() ? (pend === 1 ? `A ${esc(shortName(p))} le falta 1 toma` : `A ${esc(shortName(p))} le faltan ${pend} tomas`) : (pend === 1 ? "Te falta 1 toma" : `Te faltan ${pend} tomas`)}</span><span class="quiet">${tomadas}/${list.length}</span></div>
    ${next && nm ? `<section class="next ${late ? "late" : ""}">
      <div><p class="kicker">${late ? `ATRASADA · ${esc(next.hora)}` : `PRÓXIMA A LAS ${esc(next.hora)}`}</p><strong>${esc(nm.nombre)}</strong></div>
      <button type="button" class="btn-alarm" data-act="alarm" data-id="${esc(next.id)}">${ICON.bell} ${isCare() ? "Avisar" : "Alarma"}</button>
    </section>` : ""}
    ${groups || `<p class="empty">No hay tomas para hoy.</p>`}
    <p class="disclaimer">No reemplaza la indicación de un profesional de salud.</p>
  </div>`;
}
function screenFamilia() {
  const v = viewer();
  const cards = state.profiles.map((p) => {
    const list = dosesOf(p.id);
    const pend = list.filter((d) => d.estado !== "tomada").length;
    const late = list.filter((d) => viewEstado(d) === "atrasada").length;
    const lows = lowMeds(p.id).length;
    const bits = [
      late ? `${late} atrasada${late === 1 ? "" : "s"}` : `${pend} pendiente${pend === 1 ? "" : "s"}`,
      lows ? "stock bajo" : "",
    ].filter(Boolean).join(" · ");
    return `<button type="button" class="person ${p.id === state.activeProfileId ? "on" : ""}" data-act="pick-profile" data-id="${esc(p.id)}">
      <span class="ava" style="background:${esc(p.color)}">${esc(initial(p.nombre))}</span>
      <span class="grow">
        <strong>${esc(p.nombre)}</strong>
        <span class="tag">${esc(rolLabel(p))} · ${esc(p.edad)} años</span>
        <small>${esc(bits)}${caresYou(p) ? "" : ` · ${esc(carePhrase(p))}`}</small>
      </span>
      <span class="go">Horario</span>
    </button>`;
  }).join("");
  return `<div class="pad">
    <p class="hello">Hola, ${esc(v.nombre)}. Estas personas toman medicamentos y tú recibes los avisos.</p>
    ${cards}
    <button type="button" class="dashed" data-act="open-profiles">${ICON.plus} Agregar paciente o familiar</button>
    <button type="button" class="btn-outline" data-act="go-scan">${ICON.scan} Escanear una receta</button>
  </div>`;
}
function screenPastillero() {
  const p = active();
  const meds = medsOf(p.id);
  const lows = lowMeds(p.id);
  const cards = meds.map((m) => {
    const low = m.stock <= (m.umbralStockBajo ?? 5);
    const pct = Math.max(0, Math.min(100, Math.round((m.stock / Math.max(1, m.stockTotal)) * 100)));
    const food = instruccionTxt(m);
    return `<article class="medcard">
      <div class="med-top">
        <div class="med-ico" style="background:${esc(m.color)}">${ICON.pill}</div>
        <div style="min-width:0">
          <h3>${esc(m.nombre)}</h3>
          <p class="sub">${esc(m.dosis)} (1 ${esc(unit(m.formato))}) · <span class="days ${low ? "low" : ""}">~${daysLeft(m)} días restantes</span></p>
        </div>
        <div class="qty ${low ? "low" : ""}"><b>${m.stock}</b><small>quedan</small></div>
      </div>
      <div class="bar ${low ? "low" : ""}" role="meter" aria-valuenow="${m.stock}" aria-valuemax="${m.stockTotal}" aria-label="Stock de ${esc(m.nombre)}"><i style="width:${pct}%"></i></div>
      <div class="stock-actions">
        <button type="button" data-act="stock" data-op="-1" data-id="${esc(m.id)}" aria-label="Quitar una unidad">−1</button>
        <button type="button" data-act="stock" data-op="1" data-id="${esc(m.id)}" aria-label="Sumar una unidad">+1</button>
        <button type="button" class="btn-soft" data-act="stock" data-op="30" data-id="${esc(m.id)}">${ICON.box} Recargar (+30)</button>
      </div>
      <p class="meta">Cada ${m.frecuenciaHoras}h${food ? ` · ${esc(food)}` : ""}</p>
      <div class="chips" style="margin-top:8px">${m.horarios.map((h) => `<span class="chip">${esc(h)}</span>`).join("")}</div>
      ${m.nota ? `<p class="meta">${esc(m.nota)}</p>` : ""}
    </article>`;
  }).join("");
  const first = lows[0];
  return `<div class="pad">
    <div class="head-row">
      <div><h2>${isCare() ? `Pastillero de ${esc(shortName(p))}` : "Tu pastillero"}</h2><p class="sub">${isCare() ? `${esc(rolLabel(p))} · ` : ""}${meds.length} medicamento${meds.length === 1 ? "" : "s"}</p></div>
      <button type="button" class="btn-add" data-act="open-med">${ICON.plus} Agregar</button>
    </div>
    ${first ? `<div class="warn">
      <span>${ICON.alert}</span>
      <p><strong>Stock bajo en el pastillero (${lows.length})</strong>${esc(first.nombre)}: quedan ${first.stock}…</p>
      <button type="button" class="icon-btn" data-act="speak-stock" aria-label="Leer alerta de stock">${ICON.speaker}</button>
    </div>` : ""}
    ${cards || `<p class="empty">Aún no hay medicamentos en este perfil.</p>`}
  </div>`;
}
function screenScan() {
  const p = active();
  const busy = ui.scan === "scanning";
  const found = ui.scanFound || {};
  const bits = [found.dosis, found.freq ? `cada ${found.freq} h` : "", found.dias ? `${found.dias} días` : ""].filter(Boolean).join(" · ");
  let result = "";
  if (ui.scan === "error") {
    result = `<article class="result"><strong>No se pudo leer</strong><p class="sub">${esc(ui.scanMsg)}</p>
      <div class="row-btns"><button type="button" class="btn-outline" data-act="retry-scan">Reintentar</button></div></article>`;
  } else if (ui.scan === "result") {
    result = `<article class="result">
      <strong>${found.nombre ? `Detectado: ${esc(found.nombre)}` : "No reconocí el nombre del medicamento"}</strong>
      ${bits ? `<p class="sub">${esc(bits)}</p>` : ""}
      ${found.nota ? `<p class="sub">${esc(found.nota)}</p>` : ""}
      ${ui.scanRaw ? `<p class="raw">${esc(ui.scanRaw)}</p>` : ""}
      <p class="sub">Revisa todo antes de guardar. La letra manuscrita puede fallar.</p>
      <div class="row-btns">
        <button type="button" class="btn-primary" data-act="use-scan">${found.nombre ? "Revisar y agregar" : "Completar a mano"}</button>
        <button type="button" class="btn-outline" data-act="retry-scan">Reintentar</button>
      </div>
    </article>`;
  }
  return `<div class="pad">
    <article class="scan-hero">
      <h2>${ICON.scan} ${isCare() ? "Escanear receta" : "Tu receta"}</h2>
      <span class="tag">${isCare() ? `Se guarda en ${esc(shortName(p))}` : "Se guarda en tu tratamiento"}</span>
      <p class="sub">${isCare() ? `La receta queda en el horario de ${esc(shortName(p))}. Confírmala antes de guardar.` : "Apunta a una receta o caja impresa. El teléfono propone el medicamento y tú lo confirmas."}</p>
    </article>
    <div class="finder ${busy ? "scanning" : ""}">
      <video playsinline muted aria-label="Visor de la cámara"></video>
      <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
      <div class="beam"></div>
      <button type="button" class="icon-btn flip" data-act="camera" aria-label="Activar o cambiar cámara">${ICON.flip}</button>
    </div>
    ${busy ? `<p class="scan-status" id="scan-status" role="status">${esc(ui.scanMsg || "Leyendo la receta…")}</p>` : ""}
    <div class="scan-actions">
      <button type="button" class="btn-outline" data-act="upload" ${busy ? "disabled" : ""}>${ICON.image} Subir imagen</button>
      <button type="button" class="btn-primary" data-act="scan" ${busy ? "disabled" : ""}>${ICON.cam} Capturar y leer</button>
    </div>
    ${result}
    <p class="fine">La lectura ocurre en este teléfono y necesita internet la primera vez. Funciona mejor con texto impreso. Siempre verifica con tu receta.</p>
  </div>`;
}
function screenInicio() {
  const feats = [
    [ICON.mic, "Recordatorios Claros y por Voz", "Avisos grandes con sonido, vibración y lectura en voz alta."],
    [ICON.users, "Perfiles Familiares y Cuidadores", "Supervisa las tomas del día de varios integrantes desde arriba."],
    [ICON.box, "Pastillero con Alerta de Stock", "Controla cuántas pastillas quedan antes de que se agoten."],
    [ICON.scan, "Escaneo Inteligente de Recetas", "Reconoce la receta del doctor y programa las pastillas."],
  ];
  return `<div class="screen inicio">
    <img class="logo" src="./assets/logo.svg" alt="" width="72" height="72">
    <h1 class="brand"><span class="medi">Medi</span><span class="alerta">Alerta</span></h1>
    <p class="slogan">MEDICAMENTOS · ALERTAS · CUIDADO</p>
    <p class="lead">Recordatorios claros de medicamentos, control de pastillero y acompañamiento familiar para adultos mayores.</p>
    <p class="roles-note"><b>Cuidador:</b> ve a toda la familia y recibe las alertas.<br><b>Paciente:</b> ve solo sus pastillas, en su propio teléfono.</p>
    <button type="button" class="btn-primary" data-act="enter-care"><span>Entrar como cuidador</span><small>Demo Estudiante · Carlos, Carmen y Jorge</small></button>
    <button type="button" class="btn-outline" data-act="enter-patient"><span>Entrar como paciente</span><small>Carlos · solo sus medicamentos</small></button>
    ${feats.map(([ico, title, text]) => `<article class="feat"><span class="feat-ico">${ico}</span><span><strong>${title}</strong><p>${text}</p></span></article>`).join("")}
  </div>
  <p class="disclaimer dock">No reemplaza la indicación de un profesional de salud.</p>`;
}
function menuHtml() {
  const v = viewer();
  const p = active();
  if (!isCare()) {
    return `<div class="menu-back" data-act="close-menu"></div>
    <div class="menu" role="menu">
      <div class="session patient">
        <span class="ava" style="background:${esc(p.color)}">${esc(initial(p.nombre))}</span>
        <span><strong>${esc(p.nombre)}</strong><small>Paciente · ${esc(p.edad)} años</small><small>Tu cuidador: ${esc(p.cuidador)}</small></span>
      </div>
      <p class="kicker menu-k">Esta pantalla es solo tuya</p>
      <button type="button" class="menu-link" data-act="enter-care">${ICON.users} Cambiar a la vista del cuidador</button>
      <button type="button" class="menu-link" data-act="toggle-text">Tamaño de letra: ${state.largeText ? "Grande" : "Normal"}</button>
      <button type="button" class="menu-link" data-act="logout">Salir</button>
    </div>`;
  }
  const items = state.profiles.map((person) => `<button type="button" class="menu-item ${person.id === state.activeProfileId ? "on" : ""}" data-act="pick-profile" data-id="${esc(person.id)}">
    <span class="ava" style="background:${esc(person.color)}">${esc(initial(person.nombre))}</span>
    <span><strong>${esc(person.nombre)}</strong><small>${esc(linea(person))}</small></span>
  </button>`).join("");
  return `<div class="menu-back" data-act="close-menu"></div>
  <div class="menu" role="menu">
    <div class="session">
      <span class="ava" style="background:#1F9D6B">${esc(initial(v.nombre))}</span>
      <span><strong>${esc(v.nombre)}</strong><small>Cuidador · ${esc(v.correo)}</small></span>
    </div>
    <p class="kicker menu-k">Personas a tu cuidado</p>
    ${items}
    <hr>
    <button type="button" class="menu-link" data-act="enter-patient">${ICON.pill} Ver la pantalla de ${esc(shortName(titular()))}</button>
    <button type="button" class="menu-link" data-act="open-profiles">${ICON.plus} Agregar paciente o familiar…</button>
    <button type="button" class="menu-link" data-act="toggle-text">Tamaño de letra: ${state.largeText ? "Grande" : "Normal"}</button>
    <button type="button" class="menu-link" data-act="logout">Salir</button>
  </div>`;
}
function chrome(route, body) {
  const p = active();
  const care = isCare();
  const titles = care
    ? { familia: "Tu familia", hoy: `Horario de ${shortName(p)}`, pastillero: "Pastillero", escanear: "Escanear" }
    : { hoy: `Hola, ${shortName(p)}`, pastillero: "Tu pastillero", escanear: "Tu receta" };
  const low = lowMeds(p.id).length;
  const tabs = care
    ? `<a href="#/familia" class="${route === "familia" ? "on" : ""}"><span class="tic">${ICON.users}</span>Familia</a>
       <a href="#/hoy" class="${route === "hoy" ? "on" : ""}"><span class="tic">${ICON.cal}</span>Hoy</a>
       <a href="#/pastillero" class="${route === "pastillero" ? "on" : ""}" ${low ? `aria-label="Pastillero, ${low} alertas de stock"` : ""}><span class="tic">${ICON.pill}${low ? `<i class="badge">${low}</i>` : ""}</span>Stock</a>
       <a href="#/escanear" class="${route === "escanear" ? "on" : ""}"><span class="tic">${ICON.scan}</span>Escanear</a>`
    : `<a href="#/hoy" class="${route === "hoy" ? "on" : ""}"><span class="tic">${ICON.cal}</span>Hoy</a>
       <a href="#/pastillero" class="${route === "pastillero" ? "on" : ""}" ${low ? `aria-label="Pastillero, ${low} alertas de stock"` : ""}><span class="tic">${ICON.pill}${low ? `<i class="badge">${low}</i>` : ""}</span>Pastillero</a>
       <a href="#/escanear" class="${route === "escanear" ? "on" : ""}"><span class="tic">${ICON.scan}</span>Escanear</a>`;
  return `<header class="top">
    <div class="top-title"><p class="date">${care ? "VISTA DEL CUIDADOR" : "VISTA DEL PACIENTE"}</p><h1>${titles[route] || "MediAlerta"}</h1></div>
    <div class="top-actions">
      <button type="button" class="who" data-act="toggle-menu" aria-haspopup="menu" aria-expanded="${ui.menu}" aria-label="${care ? "Cambiar persona" : "Tu perfil"}">
        <span class="ava" style="background:${esc(care ? "#1F9D6B" : p.color)}">${esc(initial(care ? viewer().nombre : p.nombre))}</span>
        <span class="who-txt"><span class="name">${esc(care ? viewer().nombre.split(" ")[0] : shortName(p))}</span><span class="role">${care ? "Cuidador" : "Paciente"}</span></span>${ICON.chev}
      </button>
      ${care ? `<button type="button" class="plus" data-act="open-med" aria-label="Agregar medicamento">${ICON.plus}</button>` : ""}
    </div>
  </header>
  <div class="vista-switch" role="group" aria-label="Cambiar de vista">
    <button type="button" data-act="enter-care" class="${care ? "on" : ""}">Cuidador</button>
    <button type="button" data-act="enter-patient" class="${care ? "" : "on"}">Paciente</button>
  </div>
  <p class="vista-note">${care ? `Supervisas a ${esc(shortName(p))}. Los avisos llegan a ${esc(viewer().nombre)}.` : `Esto es lo que ve ${esc(shortName(p))} en su teléfono. Su cuidador es ${esc(p.cuidador)}.`}</p>
  <div class="screen">${body}</div>
  <nav class="tabs ${care ? "tabs-4" : ""}" aria-label="Secciones">
    ${tabs}
  </nav>
  ${ui.menu ? menuHtml() : ""}`;
}
function sheetMed() {
  const pre = ui.prefill || {};
  const perfil = pre.perfilId || active().id;
  const opts = state.profiles.map((p) => `<option value="${esc(p.id)}" ${p.id === perfil ? "selected" : ""}>${esc(shortName(p))} · ${esc(rolLabel(p))}</option>`).join("");
  const sug = [
    ["Paracetamol", "500 mg"], ["Ibuprofeno", "400 mg"], ["Amoxicilina", "500 mg"],
    ["Omeprazol", "20 mg"], ["Losartán", "50 mg"], ["Metformina", "850 mg"],
  ];
  const formats = [["pastilla", "Pastilla", ICON.pill], ["capsula", "Cápsula", ICON.pill], ["jarabe", "Jarabe", ICON.bottle], ["gotas", "Gotas", ICON.drops]];
  return `<div class="sheet-back" data-act="close-sheet"></div>
  <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="med-title">
    <div class="sheet-head"><div><h2 id="med-title">Agregar Medicamento</h2><p class="hint">Configura horarios y dosis del tratamiento</p></div>
      <button type="button" class="icon-btn" data-act="close-sheet" aria-label="Cerrar">${ICON.x}</button></div>
    <div class="sheet-body">
      <label class="f">Paciente o familiar<select id="f-perfil">${opts}</select></label>
      <p class="kicker">SUGERENCIAS RÁPIDAS</p>
      <div class="chips">${sug.map(([n, d]) => `<button type="button" class="sug" data-act="suggest" data-name="${esc(n)}" data-dose="${esc(d)}">${esc(n)} (${esc(d)})</button>`).join("")}</div>
      <div class="grid-2">
        <label class="f">Nombre del fármaco *<input id="f-nombre" value="${esc(pre.nombre || "")}" autocomplete="off"></label>
        <label class="f">Dosis / Presentación<input id="f-dosis" value="${esc(pre.dosis || "")}" placeholder="500 mg"></label>
      </div>
      <p class="kicker">FORMATO</p>
      <div class="formats">${formats.map(([id, label, ico]) => `<button type="button" class="fmt ${pickedFormat === id ? "on" : ""}" data-act="format" data-fmt="${id}">${ico}${label}</button>`).join("")}</div>
      <div class="grid-2">
        <label class="f">Frecuencia<select id="f-freq">
          ${[4, 6, 8, 12, 24].map((n) => `<option value="${n}" ${(String(pre.freq || 8) === String(n)) ? "selected" : ""}>Cada ${n} horas (${Math.round(24 / n)} ${24 / n === 1 ? "vez" : "veces"} al día)</option>`).join("")}
        </select></label>
        <label class="f">Primera toma del día<input id="f-hora" type="time" value="${esc(pre.hora || "08:00")}"></label>
      </div>
      <p class="kicker">HORARIOS GENERADOS</p>
      <div class="chips" id="f-slots"></div>
      <p class="opt">OPCIONAL</p>
      <label class="switch">Con comida<input id="f-comida" type="checkbox" ${pre.comida ? "checked" : ""}></label>
      <div class="grid-2">
        <label class="f">Duración (días)<input id="f-dias" type="number" min="1" inputmode="numeric" value="${esc(pre.dias || "")}"></label>
        <label class="f">Stock inicial<input id="f-stock" type="number" min="0" inputmode="numeric" value="${esc(pre.stock || "30")}"></label>
      </div>
      <p class="err" id="f-error">${esc(ui.formError)}</p>
      <p class="disclaimer">No reemplaza la indicación de un profesional de salud.</p>
    </div>
    <div class="sheet-foot"><button type="button" class="btn-save" data-act="save-med">${ICON.pill} Guardar Medicamento</button></div>
  </section>`;
}
function sheetProfiles() {
  const cards = state.profiles.map((p) => `<button type="button" class="pcard ${p.id === state.activeProfileId ? "on" : ""}" data-act="pick-profile" data-id="${esc(p.id)}">
    <span class="ava" style="background:${esc(p.color)}">${esc(initial(p.nombre))}</span>
    <span class="grow"><strong>${esc(p.nombre)}</strong><span class="tag">${esc(rolLabel(p))}</span><small>${esc(p.edad)} años · ${esc(carePhrase(p))}</small><small>${esc(p.nota)}</small></span>
    ${p.id === state.activeProfileId ? ICON.check : ""}
  </button>`).join("");
  const form = ui.addingProfile ? `<div class="grid-2">
      <label class="f">Nombre<input id="p-nombre" autocomplete="off"></label>
      <label class="f">Edad<input id="p-edad" type="number" min="0" value="70"></label>
    </div>
    <label class="f">Rol<select id="p-rol"><option value="paciente">Paciente (toma los medicamentos)</option><option value="familiar">Familiar</option></select></label>
    <label class="f">Tipo de tratamiento<select id="p-tipo"><option>Adulto Mayor</option><option>Tratamiento Temporal</option><option>Crónico</option><option>Control Metabólico</option></select></label>
    <label class="f">Cuidador que recibe las alertas<input id="p-cuidador" value="${esc(viewer().nombre)}"></label>
    <label class="consent"><input id="p-consent" type="checkbox"><span>Confirmo que tengo autorización para gestionar los datos de salud de esta persona.</span></label>
    <p class="err" id="p-error"></p>
    <button type="button" class="btn-save" data-act="save-profile">Guardar perfil</button>` : "";
  return `<div class="sheet-back" data-act="close-sheet"></div>
  <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="pro-title">
    <div class="sheet-head"><div><h2 id="pro-title">Perfiles de Pacientes</h2><p class="hint">Gestiona múltiples tratamientos por persona</p></div>
      <button type="button" class="icon-btn" data-act="close-sheet" aria-label="Cerrar">${ICON.x}</button></div>
    <div class="sheet-body">
      <p class="kicker">SELECCIONAR PACIENTE ACTIVO</p>
      ${cards}
      <button type="button" class="dashed" data-act="show-new-profile">${ICON.plus} Agregar paciente o familiar</button>
      ${form}
    </div>
  </section>`;
}
function demoInner() {
  const items = state.events.length
    ? state.events.map((e) => `<li><time>${esc(e.t)}</time><span>${esc(e.text)}</span></li>`).join("")
    : `<li><span>Aún no hay eventos.</span></li>`;
  return `<div class="demo-card">
    <h2>Panel de demo · Solemne 2</h2>
    <p class="flow">${isCare() ? `Vista del cuidador · ${esc(viewer().nombre)}` : `Vista del paciente · ${esc(shortName(active()))}`}</p>
    <button type="button" class="main" data-act="demo-alarm">Disparar recordatorio</button>
    <button type="button" data-act="demo-miss">Simular dosis no confirmada (+30 min)</button>
    <button type="button" data-act="demo-low">Forzar stock bajo</button>
    <button type="button" data-act="toggle-text">Letra grande: ${state.largeText ? "sí" : "no"}</button>
    <button type="button" data-act="reset">Reiniciar demo</button>
    <p class="kicker">REGISTRO</p>
    <ol class="log">${items}</ol>
  </div>`;
}
function alarmOverlay() {
  const d = state.doses.find((x) => x.id === ui.alarmId);
  const m = d ? medById(d.medicamentoId) : null;
  if (!d || !m) return "";
  const p = state.profiles.find((x) => x.id === d.perfilId) || active();
  const food = instruccionTxt(m);
  return `<div class="alarm" role="dialog" aria-modal="true" aria-label="Recordatorio de medicamento">
    <div class="bell-wrap">${ICON.bell}</div>
    <p>Medicamento de ${esc(shortName(p))}</p>
    <h2>${esc(m.nombre)}</h2>
    <p>${esc(m.dosis)} · 1 ${esc(unit(m.formato))}</p>
    ${food ? `<p>${esc(food)}</p>` : ""}
    <button type="button" class="wide btn-light" data-act="alarm-take" data-id="${esc(d.id)}">${ICON.check} ${isCare() ? `${esc(shortName(p))} ya lo tomó` : "Ya lo tomé"}</button>
    <button type="button" class="wide btn-ghost" data-act="snooze">Posponer 10 min</button>
  </div>`;
}
function render() {
  let route = currentRoute();
  if (route === "familia" && !isCare()) {
    history.replaceState(null, "", "#/hoy");
    route = "hoy";
  }
  const p = active();
  const body = route === "familia" ? screenFamilia() : route === "hoy" ? screenHoy() : route === "pastillero" ? screenPastillero() : route === "escanear" ? screenScan() : "";
  const app = route === "inicio" ? screenInicio() : chrome(route, body);
  const sheets = `${ui.sheet === "med" ? sheetMed() : ""}${ui.sheet === "profiles" ? sheetProfiles() : ""}${ui.sheet === "demo" ? `<div class="sheet-back" data-act="close-sheet"></div><section class="sheet demo-sheet" role="dialog" aria-label="Panel de demo"><div class="sheet-body">${demoInner()}</div></section>` : ""}`;
  document.getElementById("stage").innerHTML = `
    <div class="device ${state.largeText ? "lg" : ""} ${route === "inicio" ? "" : (isCare() ? "vista-cuidador" : "vista-paciente")}" id="device">
      ${app}
      ${sheets}
      ${alarmOverlay()}
      ${ui.notice ? `<div class="notice" role="status"><span>${ICON.bell}</span><p><strong>MediAlerta</strong>${esc(ui.notice)}</p></div>` : ""}
      ${ui.toast ? `<div class="toast" role="status">${esc(ui.toast)}</div>` : ""}
    </div>
    <aside class="demo-side" aria-label="Panel de demostración">${demoInner()}</aside>
    <button type="button" class="fab" data-act="open-demo" aria-label="Abrir panel de demo">${ICON.gear}</button>`;
  document.title = route === "inicio" ? "MediAlerta" : `MediAlerta · ${p.nombre}`;
  if (ui.sheet === "med") refreshSlots();
  if (cameraStream && route === "escanear") {
    const video = document.querySelector(".finder video");
    if (video) video.srcObject = cameraStream;
  }
}

document.addEventListener("click", (ev) => {
  const el = ev.target.closest("[data-act]");
  if (!el) return;
  const { act, id } = el.dataset;
  if (act === "enter-care") enterAs("cuidador");
  else if (act === "enter-patient") enterAs("paciente");
  else if (act === "go-scan") go("escanear");
  else if (act === "toggle-menu") { ui.menu = !ui.menu; render(); }
  else if (act === "close-menu") { ui.menu = false; render(); }
  else if (act === "pick-profile") {
    state.activeProfileId = id;
    ui.menu = false;
    ui.sheet = null;
    save();
    if (currentRoute() === "familia") go("hoy");
    else render();
  }
  else if (act === "logout") { ui.menu = false; go("inicio"); }
  else if (act === "toggle-text") { state.largeText = !state.largeText; save(); render(); }
  else if (act === "open-med") openMed(null);
  else if (act === "open-profiles") { ui.sheet = "profiles"; ui.addingProfile = false; ui.menu = false; render(); }
  else if (act === "show-new-profile") { ui.addingProfile = true; render(); }
  else if (act === "close-sheet") { ui.sheet = null; ui.addingProfile = false; render(); }
  else if (act === "format") {
    pickedFormat = el.dataset.fmt;
    document.querySelectorAll("[data-fmt]").forEach((n) => n.classList.toggle("on", n.dataset.fmt === pickedFormat));
  } else if (act === "suggest") {
    const name = document.getElementById("f-nombre");
    const dose = document.getElementById("f-dosis");
    if (name) name.value = el.dataset.name;
    if (dose) dose.value = el.dataset.dose;
  } else if (act === "save-med") saveMed();
  else if (act === "save-profile") saveProfile();
  else if (act === "take" || act === "alarm-take") take(id);
  else if (act === "undo") undo(id);
  else if (act === "alarm" || act === "demo-alarm") fireAlarm(id);
  else if (act === "snooze") { ui.alarmId = null; logEvent("Recordatorio pospuesto 10 min"); save(); flash("Recordatorio pospuesto 10 minutos"); }
  else if (act === "demo-miss") simulateMiss();
  else if (act === "demo-low") forceLow();
  else if (act === "reset") resetDemo();
  else if (act === "open-demo") { ui.sheet = "demo"; render(); }
  else if (act === "stock") changeStock(id, Number(el.dataset.op));
  else if (act === "speak-stock") {
    const lows = lowMeds(active().id);
    const text = lows.map((m) => `${m.nombre}: quedan ${m.stock}`).join(". ");
    speak(`Stock bajo en el pastillero. ${text}`);
  } else if (act === "scan") captureAndScan();
  else if (act === "upload") document.getElementById("scan-file")?.click();
  else if (act === "retry-scan") { ui.scan = "idle"; ui.scanFound = null; ui.scanRaw = ""; ui.scanMsg = ""; render(); }
  else if (act === "use-scan") {
    const f = ui.scanFound || {};
    openMed({
      nombre: f.nombre || "",
      dosis: f.dosis || "",
      formato: f.formato || "pastilla",
      freq: f.freq || "8",
      hora: f.hora || "08:00",
      dias: f.dias || "",
      stock: f.stock || "30",
      comida: !!f.comida,
      perfilId: active().id,
    });
  } else if (act === "camera") {
    facing = cameraStream ? (facing === "environment" ? "user" : "environment") : facing;
    enableCamera();
  }
});
document.addEventListener("input", (ev) => {
  if (ev.target && (ev.target.id === "f-hora" || ev.target.id === "f-freq")) refreshSlots();
});
document.addEventListener("keydown", (ev) => {
  if (ev.key !== "Escape") return;
  ui.menu = false;
  ui.sheet = null;
  ui.alarmId = null;
  render();
});
window.addEventListener("hashchange", () => {
  ui.menu = false;
  if (currentRoute() !== "escanear") stopCamera();
  render();
});
document.getElementById("scan-file")?.addEventListener("change", (ev) => {
  const file = ev.target.files && ev.target.files[0];
  ev.target.value = "";
  if (file) scanFile(file);
});
render();
