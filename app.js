/* Rechentiger – Plus und Minus bis 100 mit Tiko, dem Tigerbaby (2. Klasse, Schweiz).
   Eine Seite, kein Framework. Die Rechnungen kommen aus rechnen.js, der Fortschritt bleibt auf dem Gerät (localStorage). */
(() => {
'use strict';
const R = window.Rechnen;

/* ================================================================ Sticker
   Reihenfolge = Album. Für jede fertige Runde gibt es einen zufälligen neuen; die Krone kommt als letzter. */
const STICKERS = [
  ['schwimmen', 'Tiko schwimmt'], ['klettern', 'Tiko klettert'], ['schlafen', 'Tiko schläft'],
  ['fussball', 'Tiko spielt Fussball'], ['velo', 'Tiko fährt Velo'], ['ski', 'Tiko fährt Ski'],
  ['schoggi', 'Tiko und die Schoggi'], ['schule', 'Tiko geht zur Schule'], ['buch', 'Tiko liest'],
  ['malen', 'Tiko malt'], ['kuchen', 'Tiko hat Geburtstag'], ['schneemann', 'Tiko baut einen Schneemann'],
  ['schmetterling', 'Tiko und der Schmetterling'], ['mama', 'Tiko und Mama Tiger'], ['picknick', 'Tiko macht Picknick'],
  ['rakete', 'Tiko fliegt ins All'], ['pirat', 'Tiko, der Pirat'], ['regen', 'Tiko im Regen'],
  ['schlitten', 'Tiko fährt Schlitten'], ['sterne', 'Tiko zählt Sterne'], ['musik', 'Tiko macht Musik'],
  ['gipfel', 'Tiko auf dem Gipfel'], ['detektiv', 'Tiko, der Detektiv'], ['krone', 'Tiko, der Rechenkönig'],
];
const STICKER = Object.fromEntries(STICKERS);
const LAST = 'krone';
const img = name => `img/${name}.webp`;

/* ================================================================ Speicher */
const KEY = 'rechentiger.v1';
const DEFAULTS = { name: '', ops: 'beides', luecke: true, length: 10, answer: 'tippen', voice: true, readTasks: true, sounds: true };
let S = load();

function load() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* privates Fenster o. Ä. */ }
  d = d && typeof d === 'object' ? d : {};
  return {
    settings: Object.assign({}, DEFAULTS, d.settings || {}),
    stufen: d.stufen && typeof d.stufen === 'object' ? d.stufen : {},      // n -> { best: 0–3, rounds }
    stickers: Array.isArray(d.stickers) ? d.stickers.filter(s => STICKER[s]) : [],
    rounds: d.rounds || 0,
    albumSeen: !!d.albumSeen,
    hintClosed: !!d.hintClosed,
    installed: !!d.installed,
  };
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* egal */ } }
const best = n => (S.stufen[n] && S.stufen[n].best) || 0;
/* Empfohlen: die erste Stufe mit weniger als 2 Sternen; alles geschafft = gemischt */
function recommended() {
  for (let n = 1; n <= 9; n++) if (best(n) < 2) return n;
  return 10;
}
const name = () => (S.settings.name || '').trim();

/* ================================================================== Icons */
const I = p => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICON = {
  gear: I('<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  close: I('<path d="M6 6l12 12M18 6L6 18"/>'),
  back: I('<path d="M15 18l-6-6 6-6"/>'),
  speaker: I('<path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),
  del: I('<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="M17 9.5l-5 5M12 9.5l5 5"/>'),
  check: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  next: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  bulb: I('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>'),
  again: I('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'),
  share: I('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>'),
  install: I('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>'),
  album: I('<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 3v18"/><circle cx="14" cy="10" r="2.6"/><path d="M11 16.5c.8-1.6 1.8-2.4 3-2.4s2.2.8 3 2.4"/>'),
};
const PAW = `<svg class="paw" viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="21.5" rx="7.2" ry="6.2"/><ellipse cx="7.2" cy="13.6" rx="3.1" ry="3.8" transform="rotate(-18 7.2 13.6)"/><ellipse cx="12.6" cy="8.2" rx="3.1" ry="4" transform="rotate(-6 12.6 8.2)"/><ellipse cx="19.4" cy="8.2" rx="3.1" ry="4" transform="rotate(6 19.4 8.2)"/><ellipse cx="24.8" cy="13.6" rx="3.1" ry="3.8" transform="rotate(18 24.8 13.6)"/></svg>`;
const STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z"/></svg>';
const starsHTML = (n, cls = '') => `<span class="stars ${cls}" aria-label="${n} von 3 Sternen">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}">${STAR}</i>`).join('')}</span>`;

/* ============================================================== Ton
   Stimme: MP3s aus audio/ hintereinander (Web Audio, damit auf dem iPhone nichts stockt).
   Geräusche: kleine Klänge direkt erzeugt (keine Dateien). */
const Sound = (() => {
  let ctx = null, out = null, sfxBus = null, voiceBus = null;
  const bytes = new Map();
  let bufs = new Map(), src = null, queue = [], playing = false, tok = 0;

  function make() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* alt */ }
    try { ctx = new AC(); } catch (e) { ctx = null; return null; }
    bufs = new Map();
    out = ctx.createDynamicsCompressor();
    out.threshold.value = -12; out.knee.value = 10; out.ratio.value = 4; out.attack.value = 0.003; out.release.value = 0.25;
    out.connect(ctx.destination);
    voiceBus = ctx.createGain(); voiceBus.gain.value = 1; voiceBus.connect(out);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.5; sfxBus.connect(out);
    return ctx;
  }
  function ready() {
    if (!ctx || ctx.state === 'closed') make();
    if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
    return ctx;
  }
  function drop() {
    stop();
    if (ctx) { try { ctx.close(); } catch (e) { /* schon zu */ } }
    ctx = null;
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) drop(); });
  window.addEventListener('pagehide', drop);
  ['pointerup', 'touchend', 'keydown'].forEach(ev => window.addEventListener(ev, ready, { capture: true, passive: true }));

  function fetchBytes(n) {
    if (!bytes.has(n)) bytes.set(n, fetch(`audio/${n}.mp3`).then(r => (r.ok ? r.arrayBuffer() : null)).catch(() => null));
    return bytes.get(n);
  }
  async function buffer(n) {
    const c = ctx;
    if (!c) return null;
    if (bufs.has(n)) return bufs.get(n);
    const ab = await fetchBytes(n);
    if (!ab || c !== ctx) return null;
    try {
      const b = await new Promise((res, rej) => c.decodeAudioData(ab.slice(0), res, rej));
      if (c === ctx) bufs.set(n, b);
      return b;
    } catch (e) { return null; }
  }
  const wait = ms => new Promise(res => setTimeout(res, ms));
  function playBuf(b) {
    return new Promise(res => {
      const s = ctx.createBufferSource();
      s.buffer = b; s.connect(voiceBus);
      let done = false;
      const end = () => { if (!done) { done = true; res(); } };
      s.onended = end; src = s;
      const t0 = ctx.currentTime, c = ctx;
      s.start();
      setTimeout(end, b.duration * 1000 + 500);
      // Wächter: läuft die Uhr nicht (iOS nach dem Hintergrund), wird der Kontext beim nächsten Tippen neu gemacht
      setTimeout(() => { if (c === ctx && c.currentTime === t0) drop(); }, 800);
    });
  }
  function stop() {
    tok++; queue = []; playing = false;
    if (src) { try { src.stop(); } catch (e) { /* schon fertig */ } src = null; }
  }
  /* Spricht Zeilen nacheinander. append = hinten anhängen. Ein Eintrag {pause: ms} macht eine kleine Pause. */
  function say(names, append = false) {
    if (!append) stop();
    queue.push(...[].concat(names).filter(Boolean));
    if (!playing) pump();
  }
  async function pump() {
    if (!ready()) { queue = []; return; }
    playing = true;
    const my = tok;
    while (queue.length && my === tok) {
      const item = queue.shift();
      if (typeof item === 'object') { await wait(item.pause); continue; }
      const b = await buffer(item);
      if (my !== tok) return;
      if (!b) continue;
      await playBuf(b);
      if (my !== tok) return;
      await wait(40);
    }
    if (my === tok) { playing = false; src = null; }
  }
  const preload = names => names.forEach(n => typeof n === 'string' && fetchBytes(n));
  const busy = () => playing;

  const note = m => 440 * Math.pow(2, (m - 69) / 12);
  function env(g, t, a, peak, decay) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + decay);
  }
  function osc(type, f, t, dur, peak, dest, a = 0.004) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    env(g, t, a, peak, dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + a + dur + 0.05);
  }
  function marimba(f, t, v = 1) {
    osc('sine', f, t, 0.55, 0.3 * v, sfxBus);
    osc('sine', f * 3.93, t, 0.1, 0.06 * v, sfxBus, 0.002);
  }
  function bell(f, t, v = 1) {
    osc('sine', f, t, 1.2, 0.14 * v, sfxBus);
    osc('sine', f * 2.76, t, 0.55, 0.05 * v, sfxBus);
  }
  const PENTA = [0, 2, 4, 7, 9];
  const step = i => 72 + 12 * Math.floor(i / 5) + PENTA[i % 5];
  const on = () => S.settings.sounds && ready();
  const sfx = {
    tap() {
      if (!on()) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(1300, t); o.frequency.exponentialRampToValueAtTime(620, t + 0.045);
      env(g, t, 0.002, 0.1, 0.055);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.12);
    },
    right(streak) {
      if (!on()) return;
      const t = ctx.currentTime + 0.01, i = Math.min(Math.max(streak - 1, 0), 9);
      marimba(note(step(i)), t); marimba(note(step(i + 2)), t + 0.085, 0.9);
    },
    wrong() {
      if (!on()) return;
      const t = ctx.currentTime + 0.01;
      [[55, 0], [52, 0.15]].forEach(([m, dt]) => {
        const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'triangle'; o.frequency.value = note(m);
        f.type = 'lowpass'; f.frequency.value = 900;
        env(g, t + dt, 0.012, 0.22, 0.34);
        o.connect(f); f.connect(g); g.connect(sfxBus);
        o.start(t + dt); o.stop(t + dt + 0.5);
      });
    },
    done() {
      if (!on()) return;
      const t = ctx.currentTime + 0.05, seq = [72, 76, 79, 84, 88];
      seq.forEach((m, i) => marimba(note(m), t + i * 0.11, 0.85));
      bell(note(100), t + seq.length * 0.11, 0.8);
    },
    sparkle() {
      if (!on()) return;
      const t = ctx.currentTime + 0.02;
      [84, 88, 91, 96, 100].forEach((m, i) => bell(note(m), t + i * 0.065, 0.55));
    },
  };
  return { say, stop, preload, sfx, ready, busy };
})();
const sfx = Sound.sfx;
const voiceOn = () => S.settings.voice;
function say(names, append) { if (voiceOn()) Sound.say(names, append); }
const rnd = n => 1 + Math.floor(Math.random() * n);
const pad2 = n => String(n).padStart(2, '0');
const line = {
  hallo: () => `hallo_${pad2(rnd(3))}`,
  los: () => `los_${pad2(rnd(3))}`,
  lob: () => `lob_${pad2(rnd(12))}`,
  fast: () => `fast_${pad2(rnd(4))}`,
  fertig: () => `fertig_${pad2(rnd(3))}`,
};

/* ================================================================ Bildschirm */
const app = document.getElementById('app');
const sheetRoot = document.getElementById('sheet-root');
const fxRoot = document.getElementById('fx');
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let view = { name: 'home' };
let Q = null;            // laufende Runde
let reloadPending = false;
let timer = null;        // automatisch weiter nach »richtig«

function nav(name, params = {}, push = true) {
  closeSheet(true);
  clearTimeout(timer);
  if (view.name === 'quiz' && name !== 'quiz' && name !== 'result') { Q = null; Sound.stop(); }
  view = Object.assign({ name }, params);
  if (push) { try { history.pushState({ name }, ''); } catch (e) { /* file:// */ } }
  render();
  window.scrollTo(0, 0);
  if (name === 'home' && reloadPending) location.reload();
}
window.addEventListener('popstate', e => {
  const st = e.state || { name: 'home' };
  clearTimeout(timer);
  if (view.name === 'quiz' || view.name === 'result') { Q = null; Sound.stop(); }
  view = st.name === 'album' ? { name: 'album' } : { name: 'home' };
  closeSheet(true);
  render();
});

function render() {
  document.body.dataset.view = view.name;
  if (view.name === 'home') app.innerHTML = homeHTML();
  else if (view.name === 'album') app.innerHTML = albumHTML();
  else if (view.name === 'quiz') { app.innerHTML = quizHTML(); showTask(); }
  else if (view.name === 'result') app.innerHTML = resultHTML(view.res);
}

/* ------------------------------------------------------------------ Start */
function homeHTML() {
  const rec = recommended(), st = R.STUFEN[rec - 1], nm = name();
  return `<div class="screen home">
    <header class="bar">
      <button class="brand" data-act="hello" aria-label="Rechentiger – Tiko sagt Hallo"><img src="icons/favicon.png" alt=""><span>Rechentiger</span></button>
      <div class="bar-right">
        <button class="pill" data-act="album" aria-label="Tiger-Album: ${S.stickers.length} von ${STICKERS.length} Stickern">${ICON.album}<span class="pill-t">Album</span><b>${S.stickers.length}/${STICKERS.length}</b></button>
        <button class="icon-btn" data-act="settings" aria-label="Einstellungen">${ICON.gear}</button>
      </div>
    </header>
    <section class="hero">
      <button class="hero-tiko" data-act="tiko" aria-label="Tiko antippen"><img src="${img('tiko_hallo')}" alt="Tiko, das Tigerbaby, winkt"></button>
      <div class="bubble">
        <p class="bubble-hi">Hallo${nm ? ` ${esc(nm)}` : ''}! Ich bin Tiko.</p>
        <p>Rechnest du mit mir? Plus und Minus bis 100.</p>
        <button class="btn primary big" data-act="start" data-stufe="${rec}">${PAW}<span><b>Los geht’s!</b><small>Stufe ${rec} · ${st.name}</small></span></button>
      </div>
    </section>
    <h2 class="path-title"><span>Der Dschungelpfad</span><small>Tippe auf eine Stufe</small></h2>
    <section class="path" aria-label="Die Stufen">
      ${R.STUFEN.map(s => stoneHTML(s, rec)).join('')}
    </section>
    <div id="install-home">${installHomeHTML()}</div>
    <footer class="foot">Rechnen im Zahlenraum bis 100 · 2. Klasse · funktioniert auch ohne Internet</footer>
  </div>`;
}
function stoneHTML(s, rec) {
  const b = best(s.n), played = S.stufen[s.n] && S.stufen[s.n].rounds;
  return `<button class="stone ${s.n === rec ? 'rec' : ''} ${s.n === 10 ? 'mix' : ''}" data-act="start" data-stufe="${s.n}"
      aria-label="Stufe ${s.n}: ${s.name}${played ? `, ${b} von 3 Sternen` : ''}">
    <span class="stone-n">${s.n === 10 ? PAW : s.n}</span>
    <span class="stone-body"><span class="stone-name">${s.name}</span><span class="stone-bsp">${esc(s.bsp)}</span></span>
    ${starsHTML(b)}
    ${s.n === rec ? '<span class="stone-tag">Tiko empfiehlt</span>' : ''}
  </button>`;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---- Als App auf den Startbildschirm ----
   iPhone/iPad: Text-Tipp (Teilen → Zum Home-Bildschirm). Android: Chrome und Samsung Internet melden »beforeinstallprompt« –
   dann ein Knopf »App installieren«; sonst ein Text-Tipp mit dem Menüweg. PC: nichts. Als App geöffnet: nichts. */
const UA = navigator.userAgent;
const isIOS = /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = /Android/i.test(UA);
const androidBrowser = /SamsungBrowser/i.test(UA) ? 'samsung' : /Firefox/i.test(UA) ? 'firefox' : 'chrome';
const standalone = () => !!navigator.standalone ||
  ['standalone', 'fullscreen', 'minimal-ui'].some(m => window.matchMedia(`(display-mode: ${m})`).matches);
let installEvent = null;
window.addEventListener('beforeinstallprompt', e => {
  if (!isAndroid) return;
  e.preventDefault();
  installEvent = e;
  refreshInstall();
});
window.addEventListener('appinstalled', () => { installEvent = null; S.installed = true; save(); refreshInstall(); });
const INSTALL_STEPS = {
  ios: 'Tippe auf <b>Teilen</b> (das Quadrat mit dem Pfeil) und dann auf <b>«Zum Home-Bildschirm»</b>.',
  chrome: 'Tippe oben rechts auf <b>⋮</b> und dann auf <b>«App installieren»</b> (oder «Zum Startbildschirm hinzufügen»).',
  samsung: 'Tippe unten auf <b>≡</b>, dann auf <b>«Seite hinzufügen zu»</b> und <b>«Startbildschirm»</b>.',
  firefox: 'Tippe auf <b>⋮</b> und dann auf <b>«Installieren»</b> (oder «Zum Startbildschirm hinzufügen»).',
};
const installable = () => (isIOS || isAndroid) && !standalone();
function installInner(where) {
  if (!installable()) return '';
  if (S.installed && !installEvent) {
    return where === 'set' ? '<p class="set-note">Der Rechentiger ist schon installiert – öffne ihn über das Symbol auf dem Startbildschirm.</p>' : '';
  }
  const close = where === 'home' ? `<button class="icon-btn small" data-act="hint-close" aria-label="Tipp schliessen">${ICON.close}</button>` : '';
  if (isAndroid && installEvent) {
    return `<div class="tip ${where === 'home' ? 'card' : 'flat'}">
      <span class="tip-ic">${ICON.install}</span>
      <div class="tip-body"><p><b>Als App installieren:</b> Dann ist der Rechentiger auf dem Startbildschirm und funktioniert auch ohne Internet.</p>
        <button class="btn primary" data-act="install">${ICON.install}<span>App installieren</span></button></div>
      ${close}</div>`;
  }
  return `<div class="tip ${where === 'home' ? 'card' : 'flat'}">
    <span class="tip-ic">${isIOS ? ICON.share : ICON.install}</span>
    <div class="tip-body"><p><b>${where === 'home' ? 'Tipp für Eltern' : 'So geht’s'}:</b> ${INSTALL_STEPS[isIOS ? 'ios' : androidBrowser]} Dann ist der Rechentiger wie eine echte App da und funktioniert auch ohne Internet.</p></div>
    ${close}</div>`;
}
const installHomeHTML = () => (S.hintClosed ? '' : installInner('home'));
function installSetHTML() {
  const inner = installInner('set');
  return inner ? `<section class="set-group"><h3>Auf den ${isIOS ? 'Home-Bildschirm' : 'Startbildschirm'}</h3>${inner}</section>` : '';
}
function refreshInstall() {
  const home = document.getElementById('install-home');
  if (home) home.innerHTML = installHomeHTML();
  const set = document.getElementById('install-set');
  if (set) set.innerHTML = installSetHTML();
}

/* ------------------------------------------------------------------ Runde */
function startQuiz(stufe) {
  const st = S.settings;
  const list = R.buildRound({ stufe, ops: st.ops, luecke: st.luecke, length: st.length });
  Q = { stufe, list, i: 0, tries: 0, hinted: false, input: '', streak: 0, results: [], extra: 0, locked: false };
  Sound.preload([`stufe_${stufe}`, 'los_01', 'los_02', 'los_03', 'lob_01', 'lob_02', 'lob_03', 'lob_04', 'fast_01', 'fast_02',
    'loesung', 'wieviel', ...list.flatMap(t => [...R.voice(t), `z_${R.answerOf(t)}`])]);
  nav('quiz');
  say([`stufe_${stufe}`, line.los(), { pause: 250 }]);
  if (S.settings.readTasks) say(R.voice(Q.list[0]), true);
}
const cur = () => Q.list[Q.i];

function quizHTML() {
  const st = R.STUFEN[Q.stufe - 1];
  return `<div class="screen quiz" id="quiz">
    <header class="qbar">
      <button class="icon-btn" data-act="quit" aria-label="Runde beenden">${ICON.close}</button>
      <div class="paws" id="paws" aria-label="Fortschritt"></div>
      <button class="icon-btn" data-act="replay" aria-label="Nochmal vorlesen">${ICON.speaker}</button>
    </header>
    <div class="qmain">
      <div class="qtiko"><img id="tiko" src="${img('tiko_denkt')}" alt=""></div>
      <section class="qcard">
        <div class="qtag">Stufe ${Q.stufe} · ${st.name}</div>
        <div class="task" id="task" aria-live="polite"></div>
        <div class="fb" id="fb" aria-live="polite"></div>
        <div class="hint-wrap"><button class="hint-btn" data-act="hint" id="hint-btn">${ICON.bulb}<span>Tipp</span></button></div>
        <div class="hint" id="hint" hidden></div>
      </section>
    </div>
    <div class="pad" id="pad"></div>
  </div>`;
}
function setTiko(pose) {
  const el = document.getElementById('tiko');
  if (!el) return;
  el.src = img(pose);
  el.classList.remove('bounce', 'wobble'); void el.offsetWidth;
  if (!reduced()) el.classList.add(pose === 'tiko_jubel' ? 'bounce' : pose === 'tiko_mut' ? 'wobble' : 'x');
}
function taskHTML(t, state = '', shown = '') {
  return R.parts(t).map(p => p === null
    ? `<span class="slot ${state}" id="slot">${shown || '<i class="caret"></i>'}</span>`
    : `<span class="${typeof p === 'number' ? 'num' : 'op'}">${p}</span>`).join('');
}
function showTask() {
  const t = cur();
  Q.tries = 0; Q.hinted = false; Q.input = ''; Q.locked = false;
  document.getElementById('task').innerHTML = taskHTML(t);
  document.getElementById('fb').textContent = '';
  const h = document.getElementById('hint'); h.hidden = true; h.innerHTML = '';
  document.querySelector('.hint-wrap').hidden = false;
  document.getElementById('quiz').classList.remove('hinting');
  setTiko('tiko_denkt');
  renderPad();
  updatePaws();
}
function renderPad(state = 'input') {
  const pad = document.getElementById('pad');
  if (state === 'next') {
    pad.className = 'pad pad-next';
    pad.innerHTML = `<button class="btn primary big" data-act="next" id="next-btn"><span><b>Weiter</b></span>${ICON.next}</button>`;
    return;
  }
  if (S.settings.answer === 'waehlen') {
    pad.className = 'pad pad-choices';
    pad.innerHTML = R.choices(cur()).map(v => `<button class="key choice" data-act="choice" data-v="${v}">${v}</button>`).join('');
    return;
  }
  pad.className = 'pad pad-keys';
  pad.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<button class="key" data-act="key" data-v="${k}">${k}</button>`).join('') +
    `<button class="key fn" data-act="del" aria-label="Löschen">${ICON.del}</button>` +
    `<button class="key" data-act="key" data-v="0">0</button>` +
    `<button class="key ok" data-act="ok" aria-label="Fertig">${ICON.check}</button>`;
}
function updateSlot(state = '') {
  const slot = document.getElementById('slot');
  if (!slot) return;
  slot.className = `slot ${state} ${Q.input ? 'filled' : ''}`;
  slot.innerHTML = Q.input ? esc(Q.input) : '<i class="caret"></i>';
}
function updatePaws() {
  const el = document.getElementById('paws');
  if (!el) return;
  el.innerHTML = Q.list.map((t, i) => {
    const r = Q.results[i];
    const cls = i < Q.i ? (r && r.first ? 'ok' : 'help') : i === Q.i ? 'now' : '';
    return `<span class="pawdot ${cls} ${t.repeat ? 'rep' : ''}">${PAW}</span>`;
  }).join('');
}
function typeDigit(v) {
  if (!Q || Q.locked) return;
  if (Q.input.length >= 3 || (Q.input === '0')) { nope(document.getElementById('slot')); return; }
  Q.input += String(v);
  if (+Q.input > 100) { Q.input = Q.input.slice(0, -1); nope(document.getElementById('slot')); return; }
  sfx.tap();
  updateSlot();
}
function deleteDigit() {
  if (!Q || Q.locked || !Q.input) return;
  Q.input = Q.input.slice(0, -1);
  sfx.tap();
  updateSlot();
}
function submit(val) {
  if (!Q || Q.locked) return;
  const t = cur();
  if (val == null) {
    if (!Q.input) { nope(document.getElementById('slot')); return; }
    val = +Q.input;
  } else { Q.input = String(val); updateSlot(); }
  const ans = R.answerOf(t);
  if (val === ans) return right(t, val);
  wrong(t, val);
}
function right(t, val) {
  Q.locked = true;
  const first = Q.tries === 0 && !Q.hinted;
  Q.results[Q.i] = { first, task: t };
  Q.streak = first ? Q.streak + 1 : 0;
  updateSlot('right');
  markChoice(val, 'right');
  setTiko('tiko_jubel');
  sfx.right(Q.streak);
  if (!reduced()) burst(document.getElementById('slot'), 10);
  const fb = document.getElementById('fb');
  const serie = { 3: 'serie_3', 5: 'serie_5', 10: 'serie_10' }[Q.streak];
  fb.className = 'fb good';
  fb.textContent = serie ? `${Q.streak} richtig hintereinander!` : pickText(['Super!', 'Genau!', 'Richtig!', 'Tigerstark!', 'Toll gerechnet!']);
  say(serie || line.lob());
  const next = Q.list[Q.i + 1];
  if (next && S.settings.readTasks) say([{ pause: 200 }, ...R.voice(next)], true);
  timer = setTimeout(() => advance(), serie ? 1800 : 1250);
}
function wrong(t, val) {
  Q.tries++;
  Q.streak = 0;
  sfx.wrong();
  markChoice(val, 'wrong');
  const fb = document.getElementById('fb');
  if (Q.tries === 1) {
    Q.locked = true;
    updateSlot('wrong');
    nope(document.getElementById('slot'));
    setTiko('tiko_mut');
    fb.className = 'fb soft';
    fb.textContent = 'Fast! Versuch es nochmal.';
    say(line.fast());
    const wb = document.querySelector(`#pad [data-act="choice"][data-v="${val}"]`);
    if (wb) wb.disabled = true;
    setTimeout(() => {
      if (!Q || cur() !== t) return;
      Q.input = ''; Q.locked = false; updateSlot();
      pulse(document.getElementById('hint-btn'));
    }, 900);
    return;
  }
  // zweimal falsch: Lösung zeigen, Rechenweg dazu, später nochmal üben
  Q.locked = true;
  const ans = R.answerOf(t);
  Q.results[Q.i] = { first: false, task: t };
  Q.input = String(ans);
  updateSlot('solution');
  setTiko('tiko_mut');
  fb.className = 'fb soft';
  fb.innerHTML = `Die Lösung ist <b>${ans}</b>. Schau mal, so geht’s:`;
  showHint(false);
  say(['loesung', `z_${ans}`]);
  if (!t.repeat && Q.extra < 3) { Q.list.push(Object.assign({}, t, { repeat: true })); Q.extra++; }
  renderPad('next');
  updatePaws();
}
const pickText = a => a[Math.floor(Math.random() * a.length)];
function markChoice(val, cls) {
  const b = document.querySelector(`#pad [data-act="choice"][data-v="${val}"]`);
  if (b) b.classList.add(cls);
}
function advance() {
  clearTimeout(timer);
  if (!Q) return;
  Q.i++;
  if (Q.i >= Q.list.length) return finish();
  showTask();
  if (S.settings.readTasks && !Sound.busy()) say(R.voice(cur()));
}

/* ---- Tipp: Rechenweg und Zehnerstangen ---- */
function showHint(speak = true) {
  if (!Q) return;
  const t = cur(), w = R.weg(t), h = document.getElementById('hint');
  if (!h.hidden) return;
  Q.hinted = true;
  const n = v => (v === null || v === '?' ? '<b class="q">?</b>' : `<b>${v}</b>`);
  const row = s => `<div class="step">${n(s[0])}<i>${s[1] === '+' ? '+' : '−'}</i>${n(s[2])}<i>=</i>${n(s[3])}</div>`;
  let html = '';
  if (w.umkehr) html += `<p class="hint-note">Rechne umgekehrt: Von ${t.c} bis ${t.a} – wie viel fehlt?</p>${row(w.umkehr)}`;
  if (w.steps.length) {
    html += `<p class="hint-note">${{ tipp_zehner: 'Zuerst bis zum Zehner, dann den Rest:', tipp_zerlegen: 'Zuerst die Zehner, dann die Einer:', tipp_ergaenzen: 'In Sprüngen hochzählen:' }[w.tipp]}</p>`;
    html += `<div class="steps">${w.steps.map(row).join('')}</div>`;
    if (w.sum) html += `<div class="step sum">${w.sum.map(v => `<b>${v}</b>`).join('<i>+</i>')}<i>=</i>${n(null)}</div>`;
  }
  if (w.tipp === 'tipp_bild' || w.tipp === 'tipp_zehner') html += mengenHTML(t);
  h.innerHTML = html;
  h.hidden = false;
  document.querySelector('.hint-wrap').hidden = true;
  document.getElementById('quiz').classList.add('hinting');      // Tiko wird kleiner, damit alles Platz hat
  if (speak) { sfx.tap(); say(w.tipp); }
}
/* Zehnerstangen und Einerwürfel – wie im Schulzimmer */
function blocks(n, cls = '') {
  const tens = Math.floor(n / 10), ones = n % 10;
  const bars = Array.from({ length: tens }, () => '<span class="bar10"></span>').join('');
  const cubes = Array.from({ length: ones }, () => '<span class="cube"></span>').join('');
  return `<span class="blocks ${cls}" aria-label="${n}: ${tens} Zehner und ${ones} Einer"><span class="bars">${bars}</span><span class="cubes">${cubes}</span><span class="blocks-n">${n}</span></span>`;
}
function mengenHTML(t) {
  const sign = t.op === '+' ? '+' : '−';
  const body = t.gap
    ? `${blocks(t.a)}<i>${sign}</i><span class="blocks qbox">?</span><i>=</i>${blocks(t.c, 'res')}`
    : `${blocks(t.a)}<i>${sign}</i>${blocks(t.b, t.op === '+' ? 'add' : 'take')}`;
  return `<div class="menge">${body}</div>`;
}

function finish() {
  const done = Q.results.filter((r, i) => r && !Q.list[i].repeat);
  const firstRight = done.filter(r => r.first).length, total = done.length;
  const stars = R.stars(firstRight, total);
  const rec = S.stufen[Q.stufe] || { best: 0, rounds: 0 };
  const improved = stars > rec.best;
  rec.best = Math.max(rec.best, stars); rec.rounds = (rec.rounds || 0) + 1;
  S.stufen[Q.stufe] = rec;
  S.rounds++;
  const sticker = awardSticker();
  save();
  const res = { stufe: Q.stufe, stars, firstRight, total, improved, sticker };
  Q = null;
  nav('result', { res });
  sfx.done();
  if (!reduced()) confetti(60);
  say([stars === 3 ? 'perfekt' : line.fertig(), { pause: 300 }]);
  if (sticker) say(sticker === LAST ? 'album_voll' : 'sticker', true);
}
function awardSticker() {
  const missing = STICKERS.map(s => s[0]).filter(s => !S.stickers.includes(s));
  if (!missing.length) return null;
  const pool = missing.length > 1 ? missing.filter(s => s !== LAST) : missing;
  const s = pool[Math.floor(Math.random() * pool.length)];
  S.stickers.push(s);
  return s;
}
function resultHTML(res) {
  const st = R.STUFEN[res.stufe - 1];
  const nextStufe = res.stufe < 10 && res.stars >= 2 ? res.stufe + 1 : null;
  const msg = res.stars === 3 ? 'Alles auf Anhieb richtig!' : res.stars === 2 ? 'Super gerechnet!' : res.stars === 1 ? 'Gut gemacht!' : 'Geschafft! Übung macht den Tiger stark.';
  return `<div class="screen result">
    <div class="res-top">
      <img class="res-tiko" src="${img('tiko_jubel')}" alt="Tiko jubelt">
      <div class="res-text">
        <h1>${msg}</h1>
        <p>Stufe ${res.stufe} · ${st.name}</p>
        ${starsHTML(res.stars, 'big')}
        <p class="res-count"><b>${res.firstRight}</b> von ${res.total} Rechnungen beim ersten Mal richtig${res.improved && res.stars ? ' – neuer Rekord!' : ''}</p>
      </div>
    </div>
    ${res.sticker ? `<button class="new-sticker" data-act="album">
      <span class="rays" aria-hidden="true"></span>
      <span class="ns-label">${res.sticker === LAST ? 'Der letzte Sticker!' : 'Neuer Sticker!'}</span>
      <img src="${img('sticker_' + res.sticker)}" alt="">
      <span class="ns-title">${STICKER[res.sticker]}</span>
      <span class="ns-count">${S.stickers.length} von ${STICKERS.length} im Album</span>
    </button>` : `<p class="all-done">Du hast alle ${STICKERS.length} Sticker gesammelt – du bist der Rechenkönig!</p>`}
    <div class="res-actions">
      ${nextStufe ? `<button class="btn primary big" data-act="start" data-stufe="${nextStufe}"><span><b>Nächste Stufe</b><small>Stufe ${nextStufe} · ${R.STUFEN[nextStufe - 1].name}</small></span>${ICON.next}</button>` : ''}
      <button class="btn ${nextStufe ? '' : 'primary big'}" data-act="start" data-stufe="${res.stufe}">${ICON.again}<span>Nochmal</span></button>
      <button class="btn" data-act="home">${PAW}<span>Zum Dschungelpfad</span></button>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ Album */
function albumHTML() {
  const have = new Set(S.stickers);
  return `<div class="screen album">
    <header class="bar">
      <button class="icon-btn" data-act="home" aria-label="Zurück">${ICON.back}</button>
      <h1 class="bar-title">Tiger-Album</h1>
      <span class="count">${have.size}/${STICKERS.length}</span>
    </header>
    <p class="album-intro">Für jede geschaffte Runde bekommst du einen neuen Sticker. Sammelst du alle ${STICKERS.length}?</p>
    <section class="album-grid">
      ${STICKERS.map(([s, title], i) => have.has(s)
        ? `<button class="slotcard have" data-act="sticker" data-s="${s}" style="--r:${(i * 37 % 7) - 3}deg"><img src="${img('sticker_' + s)}" alt=""><span>${title}</span></button>`
        : `<div class="slotcard empty ${s === LAST ? 'last' : ''}">${s === LAST ? '<span class="crown">♛</span>' : PAW}<span>${s === LAST ? 'Ganz zum Schluss' : '?'}</span></div>`).join('')}
    </section>
  </div>`;
}

/* ---------------------------------------------------------- Einstellungen */
let sheetOpen = null;
function openSheet(nameOf, html) {
  sheetOpen = nameOf;
  sheetRoot.innerHTML = `<div class="sheet-bg" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  requestAnimationFrame(() => sheetRoot.classList.add('open'));
}
function closeSheet(now) {
  if (!sheetOpen) return;
  sheetOpen = null;
  sheetRoot.classList.remove('open');
  if (now) sheetRoot.innerHTML = ''; else setTimeout(() => { if (!sheetOpen) sheetRoot.innerHTML = ''; }, 260);
}
const sw = (key, label, sub) => `<div class="set-row">
  <div><div class="set-label">${label}</div>${sub ? `<div class="set-sub">${sub}</div>` : ''}</div>
  <button class="switch" role="switch" aria-checked="${!!S.settings[key]}" data-act="toggle" data-key="${key}" aria-label="${label}"><i></i></button></div>`;
const seg = (key, opts) => `<div class="seg" role="radiogroup">${opts.map(([v, l]) =>
  `<button role="radio" aria-checked="${S.settings[key] === v}" data-act="seg" data-key="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
function settingsHTML() {
  return `<div class="sheet-head"><h2>Einstellungen</h2><button class="icon-btn" data-act="close-sheet" aria-label="Schliessen">${ICON.close}</button></div>
  <div class="sheet-body">
    <section class="set-group"><h3>Name</h3>
      <input class="name-in" id="name-in" type="text" maxlength="20" autocomplete="off" placeholder="Wie heisst du?" value="${esc(S.settings.name)}">
      <p class="set-note">Tiko schreibt deinen Namen auf die Startseite. Er bleibt nur auf diesem Gerät.</p></section>
    <section class="set-group"><h3>Rechnungen</h3>
      <div class="set-row col"><div class="set-label">Welche Rechnungen?</div>${seg('ops', [['beides', 'Plus und Minus'], ['plus', 'Nur Plus'], ['minus', 'Nur Minus']])}</div>
      ${sw('luecke', 'Lücken-Rechnungen', 'Zum Beispiel 34 + _ = 59 (ab Stufe 3)')}
      <div class="set-row col"><div class="set-label">Rechnungen pro Runde</div>${seg('length', [[5, '5'], [10, '10'], [15, '15']])}</div>
      <div class="set-row col"><div class="set-label">Antwort</div>${seg('answer', [['tippen', 'Selber tippen'], ['waehlen', 'Auswählen (4 Zahlen)']])}</div>
    </section>
    <section class="set-group"><h3>Ton</h3>
      ${sw('voice', 'Tiko spricht', 'Lob, Tipps und Hilfe')}
      ${sw('readTasks', 'Rechnungen vorlesen')}
      ${sw('sounds', 'Klänge')}
      <button class="btn" data-act="test-sound">${ICON.speaker}<span>Ton testen</span></button>
    </section>
    <div id="install-set">${installSetHTML()}</div>
    <section class="set-group"><h3>Fortschritt</h3>
      <p class="set-note">${S.rounds} ${S.rounds === 1 ? 'Runde' : 'Runden'} gerechnet · ${S.stickers.length} von ${STICKERS.length} Stickern.</p>
      <button class="btn danger" data-act="reset">Alles zurücksetzen</button>
    </section>
    <p class="version">Rechentiger · Stand ${esc(window.BUILD || 'dev')} · Stimme: ElevenLabs · Schrift: Nunito (SIL OFL)</p>
  </div>`;
}
function confirmHTML(title, text, yes, act) {
  return `<div class="sheet-head"><h2>${title}</h2></div><div class="sheet-body"><p class="confirm-text">${text}</p>
    <div class="confirm-actions"><button class="btn" data-act="close-sheet">Abbrechen</button><button class="btn danger" data-act="${act}">${yes}</button></div></div>`;
}
function stickerSheetHTML(s) {
  return `<div class="sheet-head"><h2>${STICKER[s]}</h2><button class="icon-btn" data-act="close-sheet" aria-label="Schliessen">${ICON.close}</button></div>
  <div class="sheet-body sticker-big"><img src="${img('sticker_' + s)}" alt="${STICKER[s]}"></div>`;
}

/* ------------------------------------------------------------- Effekte */
function nope(el) { if (!el || reduced()) return; el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope'); }
function pulse(el) { if (!el || reduced()) return; el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }
const FX_COLORS = ['#F28A1E', '#FFC93C', '#2E9E5B', '#E8613C', '#7CC4F2'];
function burst(el, n) {
  if (!el) return;
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'), a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 60;
    p.className = 'spark';
    p.style.cssText = `left:${cx}px;top:${cy}px;background:${FX_COLORS[i % FX_COLORS.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
    fxRoot.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}
function confetti(n) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.className = 'conf';
    p.style.cssText = `left:${Math.random() * 100}vw;background:${FX_COLORS[i % FX_COLORS.length]};--d:${1.6 + Math.random() * 1.4}s;--x:${(Math.random() - 0.5) * 160}px;--r:${Math.random() * 720}deg;animation-delay:${Math.random() * 0.5}s`;
    fxRoot.appendChild(p);
    setTimeout(() => p.remove(), 3600);
  }
}

/* -------------------------------------------------------------- Tippen */
app.addEventListener('click', onClick);
sheetRoot.addEventListener('click', onClick);
sheetRoot.addEventListener('input', e => {
  if (e.target.id === 'name-in') { S.settings.name = e.target.value.slice(0, 20); save(); }
});
function onClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const act = b.dataset.act;
  switch (act) {
    case 'hello': case 'tiko': {
      sfx.tap();
      const t = document.querySelector('.hero-tiko img');
      if (t && !reduced()) { t.classList.remove('bounce'); void t.offsetWidth; t.classList.add('bounce'); }
      if (voiceOn()) Sound.say(['bruellen', { pause: 150 }, line.hallo()]);
      else if (S.settings.sounds) Sound.say('bruellen');
      break;
    }
    case 'start': sfx.tap(); startQuiz(+b.dataset.stufe); break;
    case 'album':
      sfx.tap(); nav('album');
      if (!S.albumSeen) { S.albumSeen = true; save(); say('album'); }   // die Erklärung nur beim ersten Mal
      break;
    case 'sticker': sfx.sparkle(); openSheet('sticker', stickerSheetHTML(b.dataset.s)); break;
    case 'settings': sfx.tap(); openSheet('settings', settingsHTML()); break;
    case 'close-sheet': closeSheet(); if (view.name === 'home') render(); break;
    case 'home': sfx.tap(); nav('home'); break;
    case 'key': typeDigit(+b.dataset.v); break;
    case 'del': deleteDigit(); break;
    case 'ok': submit(); break;
    case 'choice': submit(+b.dataset.v); break;
    case 'next': Sound.stop(); advance(); break;
    case 'hint': showHint(true); break;
    case 'replay': if (Q) Sound.say(R.voice(cur())); break;
    case 'quit':
      sfx.tap();
      openSheet('quit', confirmHTML('Runde beenden?', 'Dann gibt es für diese Runde keinen Sticker.', 'Beenden', 'quit-yes'));
      break;
    case 'quit-yes': Q = null; Sound.stop(); nav('home'); break;
    case 'toggle': {
      const key = b.dataset.key, val = !S.settings[key];
      S.settings[key] = val; save(); sfx.tap();
      b.setAttribute('aria-checked', String(val));
      if (!val && (key === 'voice' || key === 'readTasks')) Sound.stop();
      break;
    }
    case 'seg': {
      const key = b.dataset.key, v = key === 'length' ? +b.dataset.v : b.dataset.v;
      S.settings[key] = v; save(); sfx.tap();
      b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', String(x === b)));
      break;
    }
    case 'test-sound': sfx.right(3); setTimeout(() => Sound.say(['bruellen', { pause: 150 }, 'hallo_01']), 350); break;
    case 'reset':
      openSheet('reset', confirmHTML('Alles zurücksetzen?', 'Alle Sterne und alle Sticker im Album werden gelöscht. Das lässt sich nicht rückgängig machen.', 'Zurücksetzen', 'reset-yes'));
      break;
    case 'reset-yes':
      S.stufen = {}; S.stickers = []; S.rounds = 0; save();
      closeSheet(true); nav('home', {}, false);
      break;
    case 'hint-close': S.hintClosed = true; save(); refreshInstall(); break;
    case 'install': {
      const ev = installEvent;
      if (!ev) break;
      installEvent = null;
      try {
        ev.prompt();
        ev.userChoice.then(c => { if (c && c.outcome === 'accepted') { S.installed = true; save(); } refreshInstall(); }).catch(refreshInstall);
      } catch (err) { refreshInstall(); }
      break;
    }
  }
}
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target && e.target.tagName === 'INPUT') return;
  if (e.key === 'Escape' && sheetOpen) { closeSheet(); e.preventDefault(); return; }
  if (view.name !== 'quiz' || !Q || sheetOpen) return;
  if (/^[0-9]$/.test(e.key) && S.settings.answer === 'tippen') { typeDigit(+e.key); e.preventDefault(); }
  else if (e.key === 'Backspace') { deleteDigit(); e.preventDefault(); }
  else if (e.key === 'Enter') {
    e.preventDefault();
    if (document.getElementById('next-btn')) { Sound.stop(); advance(); } else submit();
  }
});

/* ================================================================== Start */
try { history.replaceState({ name: 'home' }, ''); } catch (e) { /* file:// */ }
render();
['tiko_denkt', 'tiko_jubel', 'tiko_mut'].forEach(n => { new Image().src = img(n); });   // Tiko wechselt dann ohne Flackern

if ('serviceWorker' in navigator && window.BUILD !== 'dev' && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;          // erster Besuch: nichts neu laden
    if (view.name === 'quiz' || view.name === 'result') reloadPending = true; else location.reload();
  });
}
})();
