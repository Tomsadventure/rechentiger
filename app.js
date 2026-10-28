/* Rechentiger – Plus und Minus bis 100 mit Tiko, dem Tigerbaby (2. Klasse, Schweiz).
   Eine Seite, kein Framework. Die Rechnungen kommen aus rechnen.js, der Fortschritt bleibt auf dem Gerät (localStorage). */
(() => {
'use strict';
const R = window.Rechnen;
const SP = window.Spiele;

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
const LAST = 'krone';
/* Zweite Album-Seite »Tikos Jahr« (2026-10-28): erst wenn die erste voll ist, gibt jede Runde einen von diesen.
   Reihenfolge = Monate (leere Plätze zeigen den Monat); Silvester kommt als letzter. */
const JAHR = [
  ['jahr_dreikoenig', 'Tiko und der Dreikönigskuchen', 'Januar'], ['jahr_eislaufen', 'Tiko läuft Schlittschuh', 'Januar'],
  ['jahr_fasnacht', 'Tiko an der Fasnacht', 'Februar'], ['jahr_iglu', 'Tiko baut ein Iglu', 'Februar'],
  ['jahr_blumen', 'Tiko und die ersten Blumen', 'März'], ['jahr_ostern', 'Tiko sucht Ostereier', 'April'],
  ['jahr_eier', 'Tiko malt Ostereier', 'April'], ['jahr_garten', 'Tiko im Garten', 'Mai'],
  ['jahr_maikaefer', 'Tiko und der Maikäfer', 'Mai'], ['jahr_erdbeeren', 'Tiko pflückt Erdbeeren', 'Juni'],
  ['jahr_zelten', 'Tiko zeltet', 'Juni'], ['jahr_glace', 'Tiko schleckt ein Glace', 'Juli'],
  ['jahr_badi', 'Tiko in der Badi', 'Juli'], ['jahr_august', 'Tiko feiert den 1. August', 'August'],
  ['jahr_alp', 'Tiko auf der Alp', 'August'], ['jahr_schulreise', 'Tiko auf der Schulreise', 'September'],
  ['jahr_aepfel', 'Tiko pflückt Äpfel', 'September'], ['jahr_drachen', 'Tiko lässt einen Drachen steigen', 'Oktober'],
  ['jahr_laub', 'Tiko springt ins Laub', 'Oktober'], ['jahr_raebeliechtli', 'Tiko und das Räbeliechtli', 'November'],
  ['jahr_marroni', 'Tiko isst Marroni', 'November'], ['jahr_samichlaus', 'Tiko und der Samichlaus', 'Dezember'],
  ['jahr_weihnachten', 'Tiko feiert Weihnachten', 'Dezember'], ['jahr_silvester', 'Tiko feiert Silvester', 'Silvester'],
];
const JAHR_LAST = 'jahr_silvester';
/* Glitzer-Sticker (2026-10-28) für besondere Leistungen, je einmal. Zählt erst ab dieser Version (»Alle 10 Stufen« = S.drei). */
const GLITZER = [
  ['glitzer_sonnenbrille', 'Tiko, der Coole', '3 Sterne in einer Runde'],
  ['glitzer_blitz', 'Tiko, der Blitz', '10 richtig hintereinander'],
  ['glitzer_marathon', 'Tiko, der Marathonläufer', 'Runde mit 15 Rechnungen und 3 Sternen'],
  ['glitzer_held', 'Tiko, der Superheld', '3 Sterne in Stufe 8'],
  ['glitzer_zauberer', 'Tiko, der Zauberer', '3 Sterne in Stufe 9'],
  ['glitzer_pokal', 'Tiko, der Champion', '3 Sterne in Stufe 10'],
  ['glitzer_baumeister', 'Tiko, der Baumeister', 'Zahlenmauer «Schwer» mit 3 Sternen'],
  ['glitzer_abenteurer', 'Tiko, der Abenteurer', 'Schatzsuche «Schwer» mit 3 Sternen'],
  ['glitzer_kapitaen', 'Tiko, der Kapitän', 'Fische fangen «Schwer» mit 3 Sternen'],
  ['glitzer_superstar', 'Tiko, der Superstar', 'Alle 10 Stufen mit 3 Sternen'],
];
const GLITZ = new Set(GLITZER.map(s => s[0]));
const WOFUER = Object.fromEntries(GLITZER.map(s => [s[0], s[2]]));

/* ================================================================ Spiele
   Jedes fertige Spiel gibt einen der 4 Sticker dieses Spiels (zweite Album-Seite). Die Aufgaben kommen aus spiele.js. */
const SPIELE = [
  { id: 'mauer', name: 'Zahlenmauer', kurz: 'Mauer', pose: 'tiko_bauen', info: 'Zwei Steine nebeneinander geben zusammen den Stein darüber.',
    levels: { leicht: 'Kleine Mauer, nur Plus', mittel: 'Plus und Minus', schwer: 'Grosse Mauer' },
    stickers: [['mauer_bauen', 'Tiko baut eine Mauer'], ['mauer_burg', 'Tiko auf der Burg'], ['mauer_turm', 'Tiko baut einen Turm'],
      ['mauer_sandburg', 'Tiko baut eine Sandburg']] },
  { id: 'schatz', name: 'Schatzsuche', kurz: 'Schatz', pose: 'tiko_schatz', info: 'Finde die Zahlen im Hunderterfeld – dann siehst du den Schatz.',
    levels: { leicht: 'Zahlen finden', mittel: 'Plus und minus 1, 2, 10, 20', schwer: 'Ohne Zahlen im Feld' },
    stickers: [['schatz_karte', 'Tiko und die Schatzkarte'], ['schatz_kiste', 'Tiko findet den Schatz'], ['schatz_schaufel', 'Tiko gräbt'],
      ['schatz_kompass', 'Tiko, der Entdecker']] },
  { id: 'fische', name: 'Fische fangen', kurz: 'Fisch', pose: 'tiko_fischen', info: 'Tippe auf den Fisch mit der richtigen Lösung.',
    levels: { leicht: 'Wie Stufe 1 bis 4', mittel: 'Wie Stufe 3 bis 7', schwer: 'Wie Stufe 5 bis 9' },
    stickers: [['fisch_netz', 'Tiko fängt einen Fisch'], ['fisch_boot', 'Tiko im Ruderboot'], ['fisch_tauchen', 'Tiko taucht'],
      ['fisch_steg', 'Tiko am Steg']] },
];
const SPIEL = Object.fromEntries(SPIELE.map(g => [g.id, g]));
const GAME_VIEWS = ['mauer', 'schatz', 'fische'];
const LEVEL_NAME = { leicht: 'Leicht', mittel: 'Mittel', schwer: 'Schwer' };
const GAME_STICKERS = SPIELE.flatMap(g => g.stickers);
const STICKER = Object.fromEntries([...STICKERS, ...JAHR, ...GLITZER, ...GAME_STICKERS].map(s => [s[0], s[1]]));
const ALL = STICKERS.length + JAHR.length + GLITZER.length + GAME_STICKERS.length;
const SCHATZBILDER = ['insel', 'hoehle', 'berg', 'meer'];
/* Sammelbuch: Seite 0 = Umschlag, 1 = »Dieses Buch gehört«, 2 = Titelseite, 3–28 = 13 gemalte Doppelseiten (7 neue am Schluss seit 2026-10-28,
   damit eingeklebte Sticker auf ihren Seiten bleiben) */
const SZENEN = [['dschungel', 'Im Dschungel'], ['meer', 'Am Meer'], ['berge', 'In den Bergen'], ['unterwasser', 'Unter Wasser'],
  ['winter', 'Im Winter'], ['nacht', 'In der Nacht'], ['burg', 'In der Burg'], ['gipfel', 'Auf dem Gipfel'],
  ['haus', 'Zu Hause'], ['see', 'Am See'], ['insel', 'Auf der Insel'], ['regen', 'Im Regen'], ['buehne', 'Auf der Bühne']];
const BUCH_SEITEN = 3 + 2 * SZENEN.length;
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
    spiele: d.spiele && typeof d.spiele === 'object' ? d.spiele : {},       // id -> { level, best: { leicht: 0–3, … }, games, pic }
    buch: buchLaden(d.buch),                                                 // { placed: [{ s, p, x, y, r }], p, seen }
    drei: Array.isArray(d.drei) ? d.drei.filter(n => n >= 1 && n <= 10) : [],  // Stufen mit 3 Sternen seit den Glitzer-Stickern
    rounds: d.rounds || 0,
    albumSeen: !!d.albumSeen,
    spieleSeen: !!d.spieleSeen,
    hintClosed: !!d.hintClosed,
    installed: !!d.installed,
  };
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* egal */ } }
/* Sammelbuch: jeder Sticker höchstens einmal eingeklebt, x/y = Mitte in % der Seite, r = Drehung in Grad */
function buchLaden(b) {
  b = b && typeof b === 'object' ? b : {};
  const seen = new Set();
  const placed = (Array.isArray(b.placed) ? b.placed : [])
    .filter(x => x && STICKER[x.s] && !seen.has(x.s) && seen.add(x.s) && x.p >= 1 && x.p < BUCH_SEITEN)
    .map(x => ({ s: x.s, p: Math.round(x.p), x: +x.x || 50, y: +x.y || 50, r: +x.r || 0 }));
  return { placed, p: Math.min(BUCH_SEITEN - 1, Math.max(0, Math.round(b.p) || 0)), seen: !!b.seen };
}
const best = n => (S.stufen[n] && S.stufen[n].best) || 0;
/* Empfohlen: die erste Stufe mit weniger als 2 Sternen; alles geschafft = gemischt */
function recommended() {
  for (let n = 1; n <= 9; n++) if (best(n) < 2) return n;
  return 10;
}
const name = () => (S.settings.name || '').trim();
function gs(id) {
  const g = S.spiele[id] = Object.assign({ level: 'leicht', best: {}, games: 0 }, S.spiele[id]);
  if (!SP.LEVELS.includes(g.level)) g.level = 'leicht';
  return g;
}
const haveOf = list => list.filter(([s]) => S.stickers.includes(s)).length;
const gamesPlayed = () => SPIELE.reduce((n, g) => n + ((S.spiele[g.id] && S.spiele[g.id].games) || 0), 0);

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
  bucket: I('<path d="M4.5 9h15l-1.7 10.3a2 2 0 0 1-2 1.7H8.2a2 2 0 0 1-2-1.7z"/><path d="M6.5 9c0-5 11-5 11 0"/>'),
  fwd: I('<path d="M9 18l6-6-6-6"/>'),
  book: I('<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5v13"/>'),
  rotL: I('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'),
  rotR: I('<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>'),
  peel: I('<path d="M5 4h9l5 5v11H5z"/><path d="M14 4v5h5"/><path d="M9 14l2 2 4-4"/>'),
};
const PAW = `<svg class="paw" viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="21.5" rx="7.2" ry="6.2"/><ellipse cx="7.2" cy="13.6" rx="3.1" ry="3.8" transform="rotate(-18 7.2 13.6)"/><ellipse cx="12.6" cy="8.2" rx="3.1" ry="4" transform="rotate(-6 12.6 8.2)"/><ellipse cx="19.4" cy="8.2" rx="3.1" ry="4" transform="rotate(6 19.4 8.2)"/><ellipse cx="24.8" cy="13.6" rx="3.1" ry="3.8" transform="rotate(18 24.8 13.6)"/></svg>`;
const STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z"/></svg>';
const starsHTML = (n, cls = '') => `<span class="stars ${cls}" aria-label="${n} von 3 Sternen">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}">${STAR}</i>`).join('')}</span>`;

/* ============================================================== Ton
   Stimme: MP3s aus audio/ hintereinander (Web Audio, damit auf dem iPhone nichts stockt).
   Geräusche: kleine Klänge direkt erzeugt (keine Dateien). */
const Sound = (() => {
  let ctx = null, out = null, sfxBus = null, voiceBus = null, fxBus = null;
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
    fxBus = ctx.createGain(); fxBus.gain.value = 0.8; fxBus.connect(out);
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
  /* Geräusch aus audio/ (Blättern, Kleben): sofort, neben der Stimme, ohne ihre Warteschlange anzufassen */
  async function fx(n) {
    if (!S.settings.sounds || !ready()) return;
    const b = await buffer(n);
    if (!b || !ctx) return;
    const s = ctx.createBufferSource();
    s.buffer = b; s.connect(fxBus); s.start();
  }

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
  return { say, stop, preload, sfx, ready, busy, fx };
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
let G = null;            // laufendes Spiel
let reloadPending = false;
let timer = null;        // automatisch weiter nach »richtig«

function nav(name, params = {}, push = true) {
  closeSheet(true);
  clearTimeout(timer);
  if (view.name === 'quiz' && name !== 'quiz' && name !== 'result') { Q = null; Sound.stop(); }
  if (GAME_VIEWS.includes(view.name) && !GAME_VIEWS.includes(name)) stopGame();
  if (view.name === 'buch') buchAufraeumen();
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
  stopGame();
  if (view.name === 'buch') buchAufraeumen();
  view = ['album', 'spiele', 'buch'].includes(st.name) ? { name: st.name } : { name: 'home' };
  closeSheet(true);
  render();
});

function render() {
  document.body.dataset.view = view.name;
  if (view.name === 'home') app.innerHTML = homeHTML();
  else if (view.name === 'album') app.innerHTML = albumHTML();
  else if (view.name === 'quiz') { app.innerHTML = quizHTML(); showTask(); }
  else if (view.name === 'result') app.innerHTML = resultHTML(view.res);
  else if (view.name === 'spiele') app.innerHTML = spieleHTML();
  else if (view.name === 'mauer') { app.innerHTML = mauerHTML(); mauerShow(); }
  else if (view.name === 'schatz') { app.innerHTML = schatzHTML(); schatzShow(); }
  else if (view.name === 'fische') { app.innerHTML = fischeHTML(); fischeSetup(); }
  else if (view.name === 'spielende') app.innerHTML = spielendeHTML(view.res);
  else if (view.name === 'buch') { app.innerHTML = buchHTML(); buchZeigen(); }
}

/* ------------------------------------------------------------------ Start */
function homeHTML() {
  const rec = recommended(), st = R.STUFEN[rec - 1], nm = name();
  return `<div class="screen home">
    <header class="bar">
      <button class="brand" data-act="hello" aria-label="Rechentiger – Tiko sagt Hallo"><img src="icons/favicon.png" alt=""><span>Rechentiger</span></button>
      <div class="bar-right">
        <button class="pill" data-act="album" aria-label="Tiger-Album: ${S.stickers.length} von ${ALL} Stickern">${ICON.album}<span class="pill-t">Album</span><b>${S.stickers.length}/${ALL}</b></button>
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
    <button class="games-banner" data-act="spiele">
      <span class="gb-pics" aria-hidden="true">${SPIELE.map(g => `<img src="${img(g.pose)}" alt="">`).join('')}</span>
      <span class="gb-text"><b>Tikos Spiele</b><small>${SPIELE.map(g => g.name).join(' · ')}</small></span>
      ${ICON.next}
    </button>
    <button class="book-banner" data-act="buch">
      <span class="bb-book" aria-hidden="true">${ICON.book}</span>
      <span class="gb-text"><b>Mein Sammelbuch</b><small>${buchStand()}</small></span>
      ${ICON.next}
    </button>
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
  Q = { stufe, list, i: 0, tries: 0, hinted: false, input: '', streak: 0, top: 0, results: [], extra: 0, locked: false };
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
  pad.innerHTML = keysHTML();
}
const keysHTML = () => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<button class="key" data-act="key" data-v="${k}">${k}</button>`).join('') +
  `<button class="key fn" data-act="del" aria-label="Löschen">${ICON.del}</button>` +
  `<button class="key" data-act="key" data-v="0">0</button>` +
  `<button class="key ok" data-act="ok" aria-label="Fertig">${ICON.check}</button>`;
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
  Q.top = Math.max(Q.top, Q.streak);
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
  if (stars === 3 && !S.drei.includes(Q.stufe)) S.drei.push(Q.stufe);
  const glitzer = awardGlitzer({
    glitzer_sonnenbrille: stars === 3, glitzer_blitz: Q.top >= 10, glitzer_marathon: stars === 3 && total >= 15,
    glitzer_held: stars === 3 && Q.stufe === 8, glitzer_zauberer: stars === 3 && Q.stufe === 9, glitzer_pokal: stars === 3 && Q.stufe === 10,
    glitzer_superstar: S.drei.length >= 10,
  });
  save();
  const res = { stufe: Q.stufe, stars, firstRight, total, improved, sticker, glitzer };
  Q = null;
  nav('result', { res });
  sfx.done();
  if (!reduced()) confetti(60);
  say([stars === 3 ? 'perfekt' : line.fertig(), { pause: 300 }]);
  stickerSagen(sticker, glitzer);
}
/* Rechen-Sticker: zuerst die erste Seite, dann Tikos Jahr – je zufällig aus den fehlenden, der letzte jeder Seite zum Schluss */
function awardSticker() {
  for (const [list, last] of [[STICKERS, LAST], [JAHR, JAHR_LAST]]) {
    const missing = list.map(s => s[0]).filter(s => !S.stickers.includes(s));
    if (!missing.length) continue;
    const pool = missing.length > 1 ? missing.filter(s => s !== last) : missing;
    const s = pool[Math.floor(Math.random() * pool.length)];
    S.stickers.push(s);
    return s;
  }
  return null;
}
/* Glitzer-Sticker: alle, deren Bedingung jetzt erfüllt ist und die noch fehlen (in der Reihenfolge des Albums) */
function awardGlitzer(erfuellt) {
  const neu = GLITZER.map(s => s[0]).filter(s => erfuellt[s] && !S.stickers.includes(s));
  S.stickers.push(...neu);
  return neu;
}
function stickerSagen(sticker, glitzer) {
  const z = sticker === LAST ? 'album_voll' : sticker === JAHR_LAST ? 'jahr_voll' : sticker && !glitzer.length ? 'sticker' : null;
  if (z) say(z, true);
  if (glitzer.length) say([{ pause: 250 }, 'glitzer'], true);
}
/* Ein Sticker-Bild; Glitzer-Sticker bekommen einen wandernden Lichtstreifen (style.css, Maske = das Bild selbst) */
const stickerImg = (s, alt = '') => GLITZ.has(s)
  ? `<span class="glanz" style="--m:url(${img('sticker_' + s)})"><img src="${img('sticker_' + s)}" alt="${alt}"></span>`
  : `<img src="${img('sticker_' + s)}" alt="${alt}">`;
/* Die neuen Sticker auf dem Ergebnis: einer gross, mehrere etwas kleiner nebeneinander */
function neueStickerHTML(sticker, count, glitzer) {
  const karten = [];
  if (sticker) karten.push({ s: sticker, label: sticker === LAST || sticker === JAHR_LAST ? 'Der letzte Sticker!' : 'Neuer Sticker!', count });
  glitzer.forEach(s => karten.push({ s, label: 'Glitzer-Sticker!', count: `Für: ${WOFUER[s]}` }));
  return `<div class="new-stickers${karten.length > 1 ? ' viele' : ''}">${karten.map((k, i) => `<button class="new-sticker${GLITZ.has(k.s) ? ' glitzer' : ''}" data-act="album" style="--i:${i}">
      <span class="rays" aria-hidden="true"></span>
      <span class="ns-label">${k.label}</span>
      ${stickerImg(k.s)}
      <span class="ns-title">${STICKER[k.s]}</span>
      <span class="ns-count">${k.count}</span>
    </button>`).join('')}</div>`;
}
function resultHTML(res) {
  const st = R.STUFEN[res.stufe - 1];
  const nextStufe = res.stufe < 10 && res.stars >= 2 ? res.stufe + 1 : null;
  const gl = res.glitzer || [];
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
    ${res.sticker || gl.length ? neueStickerHTML(res.sticker, JAHR.some(s => s[0] === res.sticker)
      ? `${haveOf(JAHR)} von ${JAHR.length} in Tikos Jahr` : `${haveOf(STICKERS)} von ${STICKERS.length} im Album`, gl)
      : `<p class="all-done">Du hast alle ${STICKERS.length + JAHR.length} Rechen-Sticker gesammelt – du bist der Rechenkönig!</p>`}
    <div class="res-actions">
      ${nextStufe ? `<button class="btn primary big" data-act="start" data-stufe="${nextStufe}"><span><b>Nächste Stufe</b><small>Stufe ${nextStufe} · ${R.STUFEN[nextStufe - 1].name}</small></span>${ICON.next}</button>` : ''}
      <button class="btn ${nextStufe ? '' : 'primary big'}" data-act="start" data-stufe="${res.stufe}">${ICON.again}<span>Nochmal</span></button>
      ${res.sticker || gl.length ? `<button class="btn" data-act="buch">${ICON.book}<span>Einkleben</span></button>` : ''}
      <button class="btn" data-act="home">${PAW}<span>Zum Dschungelpfad</span></button>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ Album */
function albumHTML() {
  const have = new Set(S.stickers);
  const card = (s, title, i) => `<button class="slotcard have${GLITZ.has(s) ? ' glitzer' : ''}" data-act="sticker" data-s="${s}" style="--r:${(i * 37 % 7) - 3}deg">${stickerImg(s)}<span>${title}</span></button>`;
  const leer = (s, last, text) => `<div class="slotcard empty ${s === last ? 'last' : ''}">${s === last ? `<span class="crown">${s === LAST ? '♛' : '★'}</span>` : PAW}<span>${s === last ? 'Ganz zum Schluss' : text}</span></div>`;
  return `<div class="screen album">
    <header class="bar">
      <button class="icon-btn" data-act="home" aria-label="Zurück">${ICON.back}</button>
      <h1 class="bar-title">Tiger-Album</h1>
      <span class="count">${have.size}/${ALL}</span>
    </header>
    <p class="album-intro">Für jede geschaffte Runde bekommst du einen neuen Sticker. Sammelst du alle ${STICKERS.length}?</p>
    <button class="book-banner small" data-act="buch">
      <span class="bb-book" aria-hidden="true">${ICON.book}</span>
      <span class="gb-text"><b>Ins Sammelbuch einkleben</b><small>${buchStand()}</small></span>
      ${ICON.next}
    </button>
    <section class="album-grid">
      ${STICKERS.map(([s, title], i) => have.has(s) ? card(s, title, i) : leer(s, LAST, '?')).join('')}
    </section>
    <h2 class="album-sub"><span>Tikos Jahr</span><b>${haveOf(JAHR)}/${JAHR.length}</b></h2>
    <p class="album-intro">Ist die erste Seite voll, gibt es für jede geschaffte Runde einen Sticker aus Tikos Jahr.</p>
    <section class="album-grid">
      ${JAHR.map(([s, title, monat], i) => have.has(s) ? card(s, title, i + 2) : leer(s, JAHR_LAST, monat)).join('')}
    </section>
    <h2 class="album-sub glitzer"><span>Glitzer-Sticker</span><b>${haveOf(GLITZER)}/${GLITZER.length}</b></h2>
    <p class="album-intro">Ganz besondere Sticker für ganz besondere Leistungen.</p>
    <section class="album-grid">
      ${GLITZER.map(([s, title, wofuer], i) => have.has(s) ? card(s, title, i + 3)
        : `<div class="slotcard empty glitzer"><span class="crown">✦</span><span>${wofuer}${s === 'glitzer_superstar' && S.drei.length ? ` (${S.drei.length} von 10)` : ''}</span></div>`).join('')}
    </section>
    <h2 class="album-sub"><span>Sticker aus Tikos Spielen</span><b>${haveOf(GAME_STICKERS)}/${GAME_STICKERS.length}</b></h2>
    <p class="album-intro">Für jedes fertige Spiel gibt es einen Sticker aus diesem Spiel.</p>
    <section class="album-grid">
      ${SPIELE.flatMap(g => g.stickers.map(([s, title], i) => have.has(s) ? card(s, title, i + 1)
        : `<button class="slotcard empty game" data-act="spiele">${PAW}<span>${g.name}</span></button>`)).join('')}
    </section>
  </div>`;
}

/* ---------------------------------------------------------- Spiele: Auswahl */
function spieleHTML() {
  const n = haveOf(GAME_STICKERS);
  return `<div class="screen spiele">
    <header class="bar">
      <button class="icon-btn" data-act="home" aria-label="Zurück">${ICON.back}</button>
      <h1 class="bar-title">Tikos Spiele</h1>
      <span class="count" aria-label="${n} von ${GAME_STICKERS.length} Spiel-Stickern">${n}/${GAME_STICKERS.length}</span>
    </header>
    <p class="album-intro">Wähle ein Spiel und wie schwer es sein soll. Für jedes fertige Spiel gibt es einen Sticker.</p>
    <section class="games">${SPIELE.map(gameCardHTML).join('')}</section>
  </div>`;
}
function gameCardHTML(g) {
  const st = gs(g.id);
  return `<article class="game-card">
    <div class="gc-top">
      <img class="gc-tiko" src="${img(g.pose)}" alt="">
      <div class="gc-text"><h2>${g.name}</h2><p>${g.info}</p></div>
    </div>
    <div class="seg lv" role="radiogroup" aria-label="Wie schwer?">${SP.LEVELS.map(l =>
      `<button role="radio" aria-checked="${st.level === l}" data-act="level" data-g="${g.id}" data-v="${l}"><span>${LEVEL_NAME[l]}</span>${starsHTML(st.best[l] || 0, 'mini')}</button>`).join('')}</div>
    <button class="btn primary big" data-act="spiel" data-g="${g.id}">${PAW}<span><b>Spielen</b><small>${g.levels[st.level]}</small></span></button>
    <div class="gc-stickers">${g.stickers.map(([s, t]) => S.stickers.includes(s)
      ? `<img src="${img('sticker_' + s)}" alt="${t}">` : `<span class="gc-empty" aria-hidden="true">${PAW}</span>`).join('')}</div>
  </article>`;
}

/* ---------------------------------------------------------- Spiele: gemeinsam */
function startGame(id, level) {
  const st = gs(id);
  if (SP.LEVELS.includes(level)) st.level = level;
  stopGame();
  G = { g: id, level: st.level, results: [], streak: 0, top: 0, tries: 0, timers: [], locked: false };
  const voices = ['los_01', 'los_02', 'los_03', 'lob_01', 'lob_02', 'lob_03', 'lob_04', 'fast_01', 'fast_02', 'loesung', `${id}_start`];
  if (id === 'mauer') {
    G.walls = SP.mauerSpiel(G.level); G.w = 0;
    setupWall();
    voices.push('mauer_tipp_plus', 'mauer_tipp_minus', 'mauer_weiter', 'mauer_fertig', ...G.walls.flatMap(w => w.v.flat().map(v => `z_${v}`)));
  } else if (id === 'schatz') {
    G.s = SP.schatz(G.level); G.i = 0; G.open = new Set();
    const pics = SCHATZBILDER.filter(p => p !== st.pic);
    G.pic = st.pic = pics[Math.floor(Math.random() * pics.length)];
    voices.push('das_ist', 'hier_ist_es', 'schatz_fertig', ...G.s.aufgaben.flatMap(a => a.voice));
  } else {
    G.list = SP.fischRunde(G.level, S.settings.ops); G.i = 0; G.caught = 0;
    voices.push('fische_fertig', ...G.list.flatMap(t => [...R.voice(t), `z_${R.answerOf(t)}`]));
  }
  save();
  Sound.preload(voices);
  nav(id);
  say([st.games < 2 ? `${id}_start` : line.los(), { pause: 250 }]);      // die Regel nur die ersten zwei Male
  if (id === 'schatz') say(G.s.aufgaben[0].voice, true);
  if (id === 'fische' && S.settings.readTasks) say(R.voice(G.list[0]), true);
}
function stopGame() {
  if (!G) return;
  G.timers.forEach(clearTimeout);
  cancelAnimationFrame(G.raf);
  G = null;
  Sound.stop();
}
/* Später etwas tun – aber nur, wenn das Spiel noch läuft */
function later(fn, ms) {
  const g = G;
  if (g) g.timers.push(setTimeout(() => { if (G === g) fn(); }, ms));
}
function scoreGame(first) {
  G.results.push({ first });
  G.streak = first ? G.streak + 1 : 0;
  G.top = Math.max(G.top, G.streak);
  return G.streak;
}
function gamePaws(total) {
  const el = document.getElementById('paws');
  if (!el || !G) return;
  el.innerHTML = Array.from({ length: total }, (_, i) => {
    const r = G.results[i];
    return `<span class="pawdot ${r ? (r.first ? 'ok' : 'help') : i === G.results.length ? 'now' : ''}">${PAW}</span>`;
  }).join('');
}
function gameFb(cls, text) {
  const fb = document.getElementById('fb');
  if (!fb) return;
  fb.className = `fb ${cls}`;
  fb.innerHTML = text;
}
function finishGame() {
  if (!G) return;
  const { g, level } = G, total = G.results.length, firstRight = G.results.filter(r => r.first).length;
  const stars = R.stars(firstRight, total), st = gs(g);
  const improved = stars > (st.best[level] || 0);
  st.best[level] = Math.max(st.best[level] || 0, stars);
  st.games = (st.games || 0) + 1;
  const missing = SPIEL[g].stickers.map(s => s[0]).filter(s => !S.stickers.includes(s));
  const sticker = missing.length ? missing[Math.floor(Math.random() * missing.length)] : null;
  if (sticker) S.stickers.push(sticker);
  const schwer = level === 'schwer' && stars === 3;
  const glitzer = awardGlitzer({ glitzer_blitz: G.top >= 10, glitzer_baumeister: schwer && g === 'mauer',
    glitzer_abenteurer: schwer && g === 'schatz', glitzer_kapitaen: schwer && g === 'fische' });
  save();
  stopGame();
  nav('spielende', { res: { g, level, stars, firstRight, total, improved, sticker, glitzer } });
  sfx.done();
  if (!reduced()) confetti(50);
  say([stars === 3 ? 'perfekt' : { mauer: 'mauer_fertig', fische: 'fische_fertig' }[g] || line.fertig(), { pause: 300 }]);
  if (sticker || glitzer.length) stickerSagen(sticker, glitzer);
  else if (haveOf(GAME_STICKERS) < GAME_STICKERS.length) say('spiel_alle', true);
}
function spielendeHTML(res) {
  const g = SPIEL[res.g], li = SP.LEVELS.indexOf(res.level);
  const harder = li < 2 && res.stars >= 2 ? SP.LEVELS[li + 1] : null;
  const msg = res.stars === 3 ? 'Alles auf Anhieb richtig!' : res.stars === 2 ? 'Super gespielt!' : res.stars === 1 ? 'Gut gemacht!' : 'Geschafft! Übung macht den Tiger stark.';
  const what = { mauer: 'Steinen beim ersten Mal richtig', schatz: 'Zahlen beim ersten Mal gefunden', fische: 'Fischen beim ersten Mal gefangen' }[res.g];
  const rest = haveOf(GAME_STICKERS) < GAME_STICKERS.length, gl = res.glitzer || [];
  return `<div class="screen result">
    <div class="res-top">
      <img class="res-tiko" src="${img('tiko_jubel')}" alt="Tiko jubelt">
      <div class="res-text">
        <h1>${msg}</h1>
        <p>${g.name} · ${LEVEL_NAME[res.level]}</p>
        ${starsHTML(res.stars, 'big')}
        <p class="res-count"><b>${res.firstRight}</b> von ${res.total} ${what}${res.improved && res.stars ? ' – neuer Rekord!' : ''}</p>
      </div>
    </div>
    ${res.sticker || gl.length ? neueStickerHTML(res.sticker, `${haveOf(g.stickers)} von ${g.stickers.length} ${g.kurz}-Stickern`, gl) : ''}
    ${res.sticker ? '' : `<p class="all-done">Du hast alle ${g.kurz}-Sticker!${rest ? ' Probier doch ein anderes Spiel.' : ' Und alle Spiel-Sticker!'}</p>`}
    <div class="res-actions">
      ${harder ? `<button class="btn primary big" data-act="spiel" data-g="${res.g}" data-level="${harder}"><span><b>Schwerer</b><small>${g.name} · ${LEVEL_NAME[harder]}</small></span>${ICON.next}</button>` : ''}
      <button class="btn ${harder ? '' : 'primary big'}" data-act="spiel" data-g="${res.g}" data-level="${res.level}">${ICON.again}<span>Nochmal</span></button>
      ${res.sticker || gl.length ? `<button class="btn" data-act="buch">${ICON.book}<span>Einkleben</span></button>` : ''}
      <button class="btn" data-act="spiele">${PAW}<span>Andere Spiele</span></button>
    </div>
  </div>`;
}
const gameHeader = right => `<header class="qbar">
  <button class="icon-btn" data-act="gquit" aria-label="Spiel beenden">${ICON.close}</button>
  <div class="paws" id="paws" aria-label="Fortschritt"></div>
  ${right}
</header>`;
const replayBtn = `<button class="icon-btn" data-act="greplay" aria-label="Nochmal vorlesen">${ICON.speaker}</button>`;

/* ---------------------------------------------------------- Spiele: Zahlenmauer */
function setupWall() {
  const w = G.walls[G.w];
  Object.assign(G, { known: new Set(w.given), done: new Map(), tries: {}, hinted: {}, choiceSets: {}, input: '', wrongK: null, src: null });
  G.sel = SP.mauerNaechster(w, G.known);
}
const wallFull = w => G.known.size === w.n * (w.n + 1) / 2;
const mauerTotal = () => G.walls.reduce((s, w) => s + w.n * (w.n + 1) / 2 - w.given.length, 0);
function mauerHTML() {
  return `<div class="screen game mauer" id="game">
    ${gameHeader(`<button class="icon-btn tipp" data-act="mhint" id="hint-btn" aria-label="Tipp">${ICON.bulb}</button>`)}
    <div class="qmain">
      <div class="qtiko"><img id="tiko" src="${img('tiko_bauen')}" alt=""></div>
      <section class="qcard mcard">
        <div class="qtag">Mauer <span id="wall-n"></span> von ${G.walls.length} · ${LEVEL_NAME[G.level]}</div>
        <div class="wall" id="wall"></div>
        <div class="fb" id="fb" aria-live="polite"></div>
        <div class="hint" id="hint" hidden></div>
      </section>
    </div>
    <div class="pad" id="pad"></div>
  </div>`;
}
function mauerShow() {
  document.getElementById('wall-n').textContent = G.w + 1;
  gameFb('', '');
  clearMauerHint();
  setTiko('tiko_bauen');
  drawWall();
  mauerPad();
  gamePaws(mauerTotal());
}
function drawWall() {
  const w = G.walls[G.w], el = document.getElementById('wall');
  if (!el) return;
  el.style.setProperty('--n', w.n);
  let html = '';
  for (let r = w.n - 1; r >= 0; r--) html += `<div class="wrow">${w.v[r].map((v, i) => brickHTML(w, SP.key(r, i), v)).join('')}</div>`;
  el.innerHTML = html;
}
function brickHTML(w, k, v) {
  const src = G.src && G.src.includes(k) ? ' src' : '';
  if (w.given.includes(k)) return `<span class="brick given${src}" data-k="${k}">${v}</span>`;
  if (G.done.has(k)) return `<span class="brick ${G.done.get(k)}${src}" data-k="${k}">${v}</span>`;
  if (G.sel !== k) return `<button class="brick empty" data-act="brick" data-k="${k}" aria-label="Leerer Stein"></button>`;
  return `<button class="brick empty sel${G.wrongK === k ? ' wrong' : ''}${G.input ? ' filled' : ''}" data-act="brick" data-k="${k}" aria-label="Ausgewählter Stein">${G.input ? esc(G.input) : '<i class="caret"></i>'}</button>`;
}
const brickEl = k => document.querySelector(`#wall [data-k="${k}"]`);
function mauerPad() {
  const pad = document.getElementById('pad');
  if (!pad || !G.sel) return;
  if (S.settings.answer === 'waehlen') {
    const ans = SP.val(G.walls[G.w].v, G.sel);
    const ch = G.choiceSets[G.sel] || (G.choiceSets[G.sel] = R.choices({ c: ans }));
    pad.className = 'pad pad-choices';
    pad.innerHTML = ch.map(v => `<button class="key choice" data-act="choice" data-v="${v}">${v}</button>`).join('');
    return;
  }
  pad.className = 'pad pad-keys';
  pad.innerHTML = keysHTML();
}
function mauerSelect(k) {
  if (!G || G.locked || G.sel === k || G.done.has(k)) return;
  sfx.tap();
  Object.assign(G, { sel: k, input: '', wrongK: null });
  clearMauerHint();
  drawWall();
  mauerPad();
}
function mauerType(d) {
  if (!G || G.locked || !G.sel) return;
  if (G.input.length >= 3 || G.input === '0' || +(G.input + d) > 100) { nope(brickEl(G.sel)); return; }
  G.input += String(d);
  sfx.tap();
  drawWall();
}
function mauerDel() {
  if (!G || G.locked || !G.sel || !G.input) return;
  G.input = G.input.slice(0, -1);
  sfx.tap();
  drawWall();
}
function mauerSubmit(v) {
  if (!G || G.locked || !G.sel) return;
  if (v == null) {
    if (!G.input) { nope(brickEl(G.sel)); return; }
    v = +G.input;
  } else { G.input = String(v); drawWall(); }
  const k = G.sel;
  if (v === SP.val(G.walls[G.w].v, k)) mauerRight(k, v); else mauerWrong(k, v);
}
function mauerRight(k, v) {
  const streak = scoreGame(!G.tries[k] && !G.hinted[k]);
  G.locked = true;
  G.known.add(k); G.done.set(k, 'right');
  Object.assign(G, { sel: null, input: '', src: null });
  markChoice(v, 'right');
  drawWall();
  gamePaws(mauerTotal());
  sfx.right(streak);
  setTiko('tiko_jubel');
  if (!reduced()) burst(brickEl(k), 10);
  gameFb('good', pickText(['Super!', 'Genau!', 'Richtig!', 'Tigerstark!', 'Gut gebaut!']));
  if (wallFull(G.walls[G.w])) return wallDone();
  say(line.lob());
  later(nextBrick, 800);
}
function mauerWrong(k, v) {
  G.tries[k] = (G.tries[k] || 0) + 1;
  G.streak = 0;
  sfx.wrong();
  markChoice(v, 'wrong');
  const cb = document.querySelector(`#pad [data-act="choice"][data-v="${v}"]`);
  if (cb) cb.disabled = true;
  setTiko('tiko_mut');
  G.locked = true;
  if (G.tries[k] === 1) {
    G.wrongK = k;
    drawWall();
    nope(brickEl(k));
    gameFb('soft', 'Fast! Versuch es nochmal.');
    say(line.fast());
    later(() => { Object.assign(G, { locked: false, wrongK: null, input: '' }); drawWall(); pulse(document.getElementById('hint-btn')); }, 900);
    return;
  }
  // zweimal falsch: Tiko zeigt die Lösung und die Rechnung dazu
  const w = G.walls[G.w], h = SP.mauerHilfe(w, G.known, k), ans = SP.val(w.v, k);
  scoreGame(false);
  G.known.add(k); G.done.set(k, 'solution');
  Object.assign(G, { sel: null, input: '', wrongK: null });
  if (h) showMauerHint(h, true);
  drawWall();
  gamePaws(mauerTotal());
  gameFb('soft', `Die Lösung ist <b>${ans}</b>.`);
  say(['loesung', `z_${ans}`]);
  if (wallFull(w)) later(wallDone, 2200); else later(nextBrick, 2600);
}
function nextBrick() {
  Object.assign(G, { locked: false, sel: SP.mauerNaechster(G.walls[G.w], G.known), input: '', wrongK: null });
  clearMauerHint();
  setTiko('tiko_bauen');
  gameFb('', '');
  drawWall();
  mauerPad();
}
function wallDone() {
  G.locked = true;
  document.getElementById('wall').classList.add('done');
  setTiko('tiko_jubel');
  gameFb('good', 'Die Mauer steht!');
  sfx.sparkle();
  if (G.w === G.walls.length - 1) { later(finishGame, 1500); return; }
  say('mauer_weiter');
  later(() => { G.w++; setupWall(); G.locked = false; mauerShow(); }, 2200);
}
/* Tipp: welche zwei Steine, welche Rechnung. Geht der gewählte Stein noch nicht, nimmt Tiko einen, der geht. */
function mauerHint() {
  if (!G || G.locked) return;
  const w = G.walls[G.w];
  let k = G.sel, h = k && SP.mauerHilfe(w, G.known, k);
  if (!h) {
    k = SP.mauerNaechster(w, G.known);
    if (!k) return;
    Object.assign(G, { sel: k, input: '' });
    h = SP.mauerHilfe(w, G.known, k);
    mauerPad();
  }
  G.hinted[k] = true;
  showMauerHint(h, false);
  drawWall();
  sfx.tap();
  say(h.op === '+' ? 'mauer_tipp_plus' : 'mauer_tipp_minus');
}
function showMauerHint(h, solved) {
  G.src = h.from;
  const el = document.getElementById('hint');
  el.innerHTML = `<p class="hint-note">${h.op === '+' ? 'Die zwei Steine darunter zusammen:' : 'Der Stein darüber minus der Stein daneben:'}</p>
    <div class="step"><b>${h.a}</b><i>${h.op === '+' ? '+' : '−'}</i><b>${h.b}</b><i>=</i>${solved ? `<b>${h.c}</b>` : '<b class="q">?</b>'}</div>`;
  el.hidden = false;
  document.getElementById('game').classList.add('hinting');
}
function clearMauerHint() {
  G.src = null;
  const el = document.getElementById('hint');
  if (el) { el.hidden = true; el.innerHTML = ''; }
  document.getElementById('game').classList.remove('hinting');
}

/* ---------------------------------------------------------- Spiele: Schatzsuche
   Unter den 100 Feldern liegt ein Schatzbild. Jede gefundene Zahl deckt ihr Puzzleteil auf. */
function schatzHTML() {
  const s = G.s;
  let cells = '';
  for (let n = 1; n <= 100; n++) {
    const [r, c] = SP.pos(n), shown = !s.versteckt || SP.anchor(n);
    // Wie im Zahlenbuch: die vier Fünferfelder abwechselnd gefärbt
    cells += `<button class="cell ${(r < 5) === (c < 5) ? 'qa' : 'qb'}${shown && s.versteckt ? ' anchor' : ''}" data-act="cell" data-n="${n}" aria-label="${shown ? n : 'Feld'}"><span>${shown ? n : ''}</span></button>`;
  }
  return `<div class="screen game schatz" id="game">
    ${gameHeader(replayBtn)}
    <div class="smain">
      <div class="sask">
        <img class="stiko" id="tiko" src="${img('tiko_schatz')}" alt="">
        <div class="sbubble"><span>Finde</span><b id="ask"></b></div>
      </div>
      <div class="field${s.versteckt ? ' versteckt' : ''}" id="field">
        <img class="field-pic" src="${img('schatzbild_' + G.pic)}" alt="">
        <div class="cells">${cells}</div>
      </div>
      <div class="fb" id="fb" aria-live="polite"></div>
    </div>
  </div>`;
}
const cellEl = n => document.querySelector(`#field [data-n="${n}"]`);
function schatzShow() {
  const ask = document.getElementById('ask');
  ask.textContent = G.s.aufgaben[G.i].text;
  ask.dataset.i = G.i;
  G.open.forEach(n => cellEl(n).classList.add('open'));
  gamePaws(G.s.ziele.length);
}
function schatzTap(n) {
  if (!G || G.locked) return;
  const a = G.s.aufgaben[G.i];
  if (n === a.n) { schatzFound(G.tries === 0); return; }
  G.tries++;
  G.streak = 0;
  sfx.wrong();
  const el = cellEl(n);
  el.classList.remove('peek'); void el.offsetWidth; el.classList.add('peek');      // zeigt kurz, welche Zahl das war
  nope(el);
  setTiko('tiko_mut');
  if (G.tries === 1) {
    gameFb('soft', `Das ist ${n}. Versuch es nochmal!`);
    say(['das_ist', `z_${n}`]);
    return;
  }
  // zweimal daneben: Tiko zeigt das Feld
  G.locked = true;
  gameFb('soft', `Das ist ${n}. Schau, hier ist ${a.n}!`);
  say(['das_ist', `z_${n}`, { pause: 200 }, 'hier_ist_es']);
  const t = cellEl(a.n);
  t.classList.add('show');
  t.firstChild.textContent = a.n;           // auch wenn die Zahlen versteckt sind
  later(() => schatzFound(false), 2200);
}
function schatzFound(first) {
  G.locked = true;
  const streak = scoreGame(first), a = G.s.aufgaben[G.i], target = cellEl(a.n);
  sfx.right(streak);
  setTiko('tiko_jubel');
  target.classList.remove('show');
  if (!reduced()) burst(target, 10);
  openTeil(G.i);
  gamePaws(G.s.ziele.length);
  gameFb('good', first ? pickText(['Super!', 'Gefunden!', 'Genau!', 'Tigerstark!']) : `Da ist ${a.n}!`);
  if (first) say(line.lob());
  if (G.i === G.s.ziele.length - 1) { later(schatzDone, 1300); return; }
  later(() => {
    Object.assign(G, { i: G.i + 1, tries: 0, locked: false });
    setTiko('tiko_schatz');
    gameFb('', '');
    schatzShow();
    say(G.s.aufgaben[G.i].voice);
  }, 1500);
}
function openTeil(i) {
  const [zr, zc] = SP.pos(G.s.ziele[i]);
  for (let n = 1; n <= 100; n++) {
    if (G.s.teil[n] !== i) continue;
    const [r, c] = SP.pos(n), el = cellEl(n);
    G.open.add(n);
    el.style.transitionDelay = reduced() ? '0ms' : `${Math.round(Math.hypot(r - zr, c - zc) * 60)}ms`;
    el.classList.add('open');
  }
}
function schatzDone() {
  setTiko('tiko_jubel');
  document.getElementById('field').classList.add('done');
  sfx.sparkle();
  if (!reduced()) confetti(40);
  say('schatz_fertig');
  gameFb('good', `<span>Du hast den Schatz gefunden!</span><button class="btn primary" data-act="schatz-weiter" id="schatz-weiter"><span>Weiter</span>${ICON.next}</button>`);
}

/* ---------------------------------------------------------- Spiele: Fische fangen
   4 Fische schwimmen in 4 Bahnen hin und her, jeder trägt eine Zahl. Bewegt wird mit requestAnimationFrame. */
const FISH = 4;
function fischeHTML() {
  return `<div class="screen game fische" id="game">
    ${gameHeader(replayBtn)}
    <section class="fcard">
      <img class="ftiko" id="tiko" src="${img('tiko_fischen')}" alt="">
      <div class="task" id="task" aria-live="polite"></div>
      <div class="bucket" id="bucket" aria-label="Gefangene Fische">${ICON.bucket}<b id="caught">0</b></div>
    </section>
    <div class="fb" id="fb" aria-live="polite"></div>
    <div class="pond" id="pond">
      <span class="lily l1"></span><span class="lily l2"></span><span class="lily l3"></span>
      ${Array.from({ length: FISH }, (_, i) => `<button class="fish${i % 2 ? ' left' : ''}" data-act="fish" data-i="${i}"><img src="${img('fisch')}" alt=""><span class="fnum"></span></button>`).join('')}
    </div>
  </div>`;
}
function fischeSetup() {
  const pond = document.getElementById('pond'), W = pond.clientWidth;
  G.T = { leicht: 10, mittel: 9, schwer: 8 }[G.level] * (reduced() ? 3 : 1);      // Sekunden für einmal quer durch den Teich
  G.fish = [...pond.querySelectorAll('.fish')].map((el, i) => ({ el, dir: i % 2 ? -1 : 1, rel: 0.8 + Math.random() * 0.4, state: 'swim', v: null, next: null }));
  layoutFish();
  G.fish.forEach(f => { f.x = Math.random() * Math.max(0, W - f.w); });
  document.getElementById('caught').textContent = G.caught;
  fischeTask();
  G.last = 0;
  G.raf = requestAnimationFrame(fischeTick);
}
function layoutFish() {
  const pond = document.getElementById('pond');
  if (!pond || !G || !G.fish) return;
  const lane = pond.clientHeight / G.fish.length;
  G.fish.forEach((f, i) => {
    f.w = f.el.offsetWidth; f.h = f.el.offsetHeight;
    f.el.style.top = `${Math.round(lane * i + Math.max(0, (lane - f.h) / 2))}px`;
  });
}
window.addEventListener('resize', () => { if (G && G.g === 'fische') layoutFish(); });
function fischeTick(ts) {
  const pond = G && G.g === 'fische' && document.getElementById('pond');
  if (!pond) return;
  const dt = G.last ? Math.min(0.05, (ts - G.last) / 1000) : 0, W = pond.clientWidth;
  G.last = ts;
  for (const f of G.fish) {
    if (f.state === 'caught') continue;
    f.x += f.dir * (W / G.T) * f.rel * (f.state === 'flee' ? 4 : 1) * dt;
    if (f.dir > 0 ? f.x > W + 8 : f.x < -f.w - 8) {        // hinten hinaus, vorne wieder herein
      f.x = f.dir > 0 ? -f.w - 8 - Math.random() * 60 : W + 8 + Math.random() * 60;
      if (f.state === 'flee') { f.state = 'swim'; if (f.next != null) setFishNum(f, f.next); }
    }
    f.el.style.transform = `translateX(${Math.round(f.x)}px)`;
  }
  G.raf = requestAnimationFrame(fischeTick);
}
function fischeTask() {
  const t = G.list[G.i], nums = R.shuffle(t.fische.slice()), task = document.getElementById('task');
  task.innerHTML = taskHTML(t);
  task.dataset.i = G.i;
  G.fish.forEach((f, i) => { if (f.state === 'flee') f.state = 'swim'; f.next = null; setFishNum(f, nums[i]); });
  G.tries = 0;
  gamePaws(G.list.length);
}
function setFishNum(f, v) {
  f.v = v;
  f.el.dataset.v = v;
  f.el.querySelector('.fnum').textContent = v;
  f.el.classList.remove('glow', 'flee', 'renew'); void f.el.offsetWidth;
  if (!reduced()) f.el.classList.add('renew');
}
/* Ein falscher Fisch, der weggeschwommen ist, kommt mit einer neuen falschen Zahl zurück */
function freshWrong(ans, used) {
  const c = [1, 2, 10, 11, 9, 3, 20, 5].flatMap(d => [ans + d, ans - d]).filter(v => v >= 0 && v <= 100 && !used.includes(v) && v !== ans);
  return pickText(c);
}
function fishTap(i) {
  if (!G || G.locked || !G.fish) return;
  const f = G.fish[i], ans = R.answerOf(G.list[G.i]);
  if (!f || f.state !== 'swim') return;
  if (f.v === ans) { fishCaught(f, ans); return; }
  G.tries++;
  G.streak = 0;
  sfx.wrong();
  f.state = 'flee';
  f.el.classList.add('flee');
  f.next = freshWrong(ans, G.fish.map(x => x.v));
  setTiko('tiko_mut');
  if (G.tries === 1) { gameFb('soft', 'Fast! Versuch es nochmal.'); say(line.fast()); return; }
  // zweimal daneben: der richtige Fisch leuchtet
  const right = G.fish.find(x => x.v === ans);
  if (right) right.el.classList.add('glow');
  gameFb('soft', `Die Lösung ist <b>${ans}</b>. Fang den leuchtenden Fisch!`);
  say(['loesung', `z_${ans}`]);
}
function fishCaught(f, ans) {
  G.locked = true;
  const streak = scoreGame(G.tries === 0);
  G.caught++;
  sfx.right(streak);
  setTiko('tiko_jubel');
  const slot = document.getElementById('slot');
  if (slot) { slot.className = 'slot right filled'; slot.textContent = ans; }
  gameFb('good', pickText(['Gefangen!', 'Super!', 'Genau!', 'Tigerstark!']));
  // der Fisch springt in den Eimer (als Kopie über allem, damit der Teichrand ihn nicht abschneidet)
  const r = f.el.getBoundingClientRect(), b = document.getElementById('bucket').getBoundingClientRect();
  if (!reduced()) {
    const fly = document.createElement('img');
    fly.src = img('fisch'); fly.className = 'fly-fish';
    fly.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;--dx:${b.left + b.width / 2 - r.left - r.width / 2}px;--dy:${b.top + b.height / 2 - r.top - r.height / 2}px`;
    fxRoot.appendChild(fly);
    setTimeout(() => fly.remove(), 800);
  }
  f.state = 'caught';
  f.el.style.visibility = 'hidden';
  later(() => {
    document.getElementById('caught').textContent = G.caught;
    pulse(document.getElementById('bucket'));
    const W = document.getElementById('pond').clientWidth;
    f.x = f.dir > 0 ? -f.w - 8 : W + 8;
    f.el.style.transform = `translateX(${f.x}px)`;
    f.el.style.visibility = '';
    f.state = 'swim';
  }, 650);
  gamePaws(G.list.length);
  say(line.lob());
  if (G.i === G.list.length - 1) { later(finishGame, 1300); return; }
  later(() => {
    Object.assign(G, { i: G.i + 1, locked: false });
    setTiko('tiko_fischen');
    gameFb('', '');
    fischeTask();
    if (S.settings.readTasks) say(R.voice(G.list[G.i]));
  }, 1300);
}

/* ---------------------------------------------------------- Sammelbuch
   Ein Buch zum freien Einkleben: Sticker aus dem Stapel unten auf eine Seite
   ziehen (oder antippen), verschieben, drehen (Knöpfe oder zwei Finger), wieder ablösen. Blättern mit den Pfeilen, Wischen
   oder den Pfeiltasten. Breiter Bildschirm: Doppelseite, sonst eine Seite. Jeder Sticker lässt sich genau einmal einkleben.
   Überarbeitet 2026-10-28 nach einem Video vom iPad (in allen drei Apps gleich): Blättern ohne Flackern (blaettern), Sticker
   ohne Aufblitzen (einkleben), Ziehen mit dem Finger auf iPhone/iPad (»Ziehen«). */
const BK = { busy: false, pend: null, drag: null, swipe: null, roll: null, rollRaf: 0, sel: null, L: null, from: 'home', nr: 0, schluck: false };
const STICKER_BREITE = 0.32;                  // Anteil der Seitenbreite (gleich wie .pst in style.css)
const stickerBild = s => img('sticker_' + s);
const stickerName = s => STICKER[s];
const eingeklebt = () => S.buch.placed.filter(x => S.stickers.includes(x.s));
const freieSticker = () => S.stickers.filter(s => !S.buch.placed.some(x => x.s === s)).reverse();      // der neuste zuerst
const buchStand = () => (S.stickers.length ? `${eingeklebt().length} von ${S.stickers.length} Stickern eingeklebt` : 'Hier klebst du deine Sticker ein');
function seiteInfo(p) {
  if (p === 0) return { art: 'umschlag' };
  if (p === 1) return { art: 'exlibris' };
  if (p === 2) return { art: 'titel' };
  return { art: 'szene', szene: Math.floor((p - 3) / 2), links: (p - 3) % 2 === 0, nr: p - 2 };
}
/* Doppelseiten: 0 = zu (nur der Umschlag, rechts), 1 = Seiten 1 + 2, 2 = 3 + 4 … */
const blattVon = p => (p === 0 ? 0 : Math.ceil(p / 2));
const seitenVon = s => (s === 0 ? [null, 0] : [2 * s - 1, 2 * s]);
const LETZTES_BLATT = blattVon(BUCH_SEITEN - 1);
const knoten = html => { const d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; };   // lädt die Bilder schon
const pstEl = s => document.querySelector(`#book .spread .pst[data-s="${CSS.escape(s)}"]`);

function buchHTML() {
  return `<div class="screen buch" id="buch">
    <header class="bar">
      <button class="icon-btn" data-act="buch-zu" aria-label="Zurück">${ICON.back}</button>
      <h1 class="bar-title">Sammelbuch</h1>
      <span class="count" id="buch-count"></span>
    </header>
    <div class="stage" id="stage"><div class="book" id="book"></div></div>
    <nav class="buch-nav">
      <button class="icon-btn" data-act="blatt" data-d="-1" id="blatt-zurueck" aria-label="Zurückblättern">${ICON.back}</button>
      <span class="buch-wo" id="buch-wo"></span>
      <button class="icon-btn" data-act="blatt" data-d="1" id="blatt-vor" aria-label="Weiterblättern">${ICON.fwd}</button>
    </nav>
    <section class="tray" id="tray" aria-label="Deine Sticker zum Einkleben"></section>
    <div class="st-tools" id="st-tools" hidden>
      <button data-act="st-rot" data-d="-15" aria-label="Nach links drehen">${ICON.rotL}</button>
      <button data-act="st-rot" data-d="15" aria-label="Nach rechts drehen">${ICON.rotR}</button>
      <button class="weg" data-act="st-weg">${ICON.peel}<span>Ablösen</span></button>
    </div>
  </div>`;
}
function oeffneBuch() {
  BK.from = ['album', 'spiele'].includes(view.name) ? view.name : 'home';
  Sound.preload(['blaettern', 'kleben', 'abloesen', 'buch_start', 'buch_klebt', 'buch_leer']);
  nav('buch');
  if (!S.buch.seen) { S.buch.seen = true; save(); say('buch_start'); }        // die Erklärung nur beim ersten Mal
  else if (S.stickers.length && !freieSticker().length) say('buch_leer');
}
function buchZeigen() { zeichneStapel(); zeichneBuch(); }          // zuerst der Stapel: seine Höhe bestimmt die Buchgrösse
function buchAufraeumen() {
  if (BK.drag) BK.drag.g.remove();
  stoppeRollen();
  Object.assign(BK, { drag: null, pend: null, swipe: null, roll: null, sel: null, busy: false, nr: BK.nr + 1 });
}
/* Wie gross wird eine Seite? Seiten sind 3 : 4 (hoch). Doppelseite, wenn genug Breite da ist (iPad quer, PC). */
function buchMasse() {
  const st = document.getElementById('stage'), W = st.clientWidth, H = st.clientHeight - 20;
  const doppel = W >= 640 && W / H >= 1.15;
  const pw = Math.floor(Math.max(120, doppel ? Math.min(W / 2 - 16, H * 0.75) : Math.min(W - 20, H * 0.75)));
  return { doppel, pw, ph: Math.round(pw / 0.75) };
}
const masseNeu = () => { const L = buchMasse(); return !BK.L || L.pw !== BK.L.pw || L.doppel !== BK.L.doppel; };
/* Das ganze Buch neu – nur beim Öffnen, bei einer neuen Bildschirmgrösse und ohne Animationen; sonst wird nur verschoben */
function zeichneBuch() {
  const book = document.getElementById('book');
  if (!book) return;
  const L = BK.L = buchMasse(), s = blattVon(S.buch.p);
  const [l, r] = L.doppel ? seitenVon(s) : [null, S.buch.p];
  book.className = `book ${L.doppel ? 'doppel' : 'einzel'}${L.doppel && s === 0 ? ' zu' : ''}`;
  book.style.setProperty('--pw', `${L.pw}px`);
  book.style.setProperty('--ph', `${L.ph}px`);
  book.innerHTML = `<div class="spread">${L.doppel ? seiteHTML(l, 'links') : ''}${seiteHTML(r, L.doppel ? 'rechts' : 'solo')}</div>`;
  buchLeiste();
}
/* Pfeile, »Seite … · …«, Zähler oben rechts und Werkzeug – passend zur aufgeschlagenen Seite */
function buchLeiste() {
  const L = BK.L, s = blattVon(S.buch.p);
  document.getElementById('blatt-vor').disabled = L.doppel ? s >= LETZTES_BLATT : S.buch.p >= BUCH_SEITEN - 1;
  document.getElementById('blatt-zurueck').disabled = S.buch.p === 0;
  document.getElementById('buch-wo').textContent = woText(L.doppel, s);
  const n = eingeklebt().length, c = document.getElementById('buch-count');
  c.textContent = `${n}/${S.stickers.length}`;
  c.setAttribute('aria-label', `${n} von ${S.stickers.length} Stickern eingeklebt`);
  if (BK.sel != null && !pstEl(BK.sel)) BK.sel = null;
  zeigeWerkzeug();
}
function woText(doppel, s) {
  const p = S.buch.p;
  if (p === 0) return 'Umschlag';
  if (doppel ? s === 1 : p <= 2) return doppel ? 'Vorne im Buch' : p === 1 ? 'Dieses Buch gehört …' : 'Titelseite';
  const a = seiteInfo(doppel ? 2 * s - 1 : p);
  return doppel ? `Seite ${a.nr}–${a.nr + 1} · ${SZENEN[a.szene][1]}` : `Seite ${a.nr} von ${2 * SZENEN.length} · ${SZENEN[a.szene][1]}`;
}
const pstHTML = x => `<img class="pst${BK.sel === x.s ? ' sel' : ''}" data-act="pst" data-s="${x.s}" src="${stickerBild(x.s)}" alt="${esc(stickerName(x.s))}" draggable="false" style="left:${x.x}%;top:${x.y}%;--r:${x.r}deg">`;
/* Eine Seite mit ihren Stickern (zuletzt geklebt = zuoberst) */
function seiteHTML(p, seite) {
  if (p == null) return `<div class="page ${seite} leer"></div>`;
  const a = seiteInfo(p);
  if (a.art === 'umschlag') {
    return `<div class="page ${seite} umschlag" data-act="buch-auf" style="background-image:url(${img('buch_umschlag')})">
      <span class="u-titel"><small>Mein</small><b>Tiger-Sammelbuch</b></span>
      <span class="u-bild"><img src="${img('tiko_hallo')}" alt=""></span>
      <span class="u-name">${esc(name())}</span>
    </div>`;
  }
  let inhalt = '', stil = '', cls = a.art;
  if (a.art === 'exlibris') {
    inhalt = `<div class="exlibris-rahmen"><img src="${img('tiko_hallo')}" alt=""><span class="ex-klein">Dieses Buch gehört</span>
      <span class="ex-name">${esc(name()) || '…………'}</span><span class="ex-pfoten">${PAW}${PAW}${PAW}</span></div>`;
  } else if (a.art === 'titel') {
    inhalt = `<div class="titel-inhalt"><span class="t-klein">Mein</span><span class="t-gross">Tiger-Sammelbuch</span><img src="${img('tiko_jubel')}" alt="">
      <span class="t-text">Zieh deine Sticker von unten auf eine Seite und kleb sie ein, wo du willst. Tippst du einen an, kannst du ihn drehen oder ablösen.</span></div>`;
  } else {
    stil = ` style="background-image:url(${img('seite_' + SZENEN[a.szene][0])})"`;
    cls += a.links ? ' halb-l' : ' halb-r';
    inhalt = `${a.links ? `<span class="szene-name">${SZENEN[a.szene][1]}</span>` : ''}<span class="seiten-nr">${a.nr}</span>`;
  }
  const st = S.buch.placed.filter(x => x.p === p && S.stickers.includes(x.s));
  return `<div class="page ${seite} ${cls}" data-p="${p}"${stil}>${inhalt}${st.map(pstHTML).join('')}<i class="falz" aria-hidden="true"></i></div>`;
}
const stapelKnopfHTML = s => `<button class="tray-st" data-act="tray-st" data-s="${s}" aria-label="${esc(stickerName(s))} einkleben"><img src="${stickerBild(s)}" alt="" draggable="false"></button>`;
function zeichneStapel() {
  const t = document.getElementById('tray');
  if (!t) return;
  const frei = freieSticker();
  t.innerHTML = frei.length
    ? `<div class="tray-kopf"><b>Deine Sticker (${frei.length})</b><span>Nach oben auf eine Seite ziehen oder antippen</span></div>
      <div class="tray-row">${frei.map(stapelKnopfHTML).join('')}</div>`
    : `<p class="tray-leer">${S.stickers.length ? 'Alle deine Sticker sind eingeklebt. Neue bekommst du beim Rechnen und in den Spielen.' : 'Noch keine Sticker. Rechne eine Runde oder spiele ein Spiel – dann bekommst du den ersten!'}</p>`;
}
/* Stapel ohne ihn neu zu zeichnen: einen Sticker herausnehmen / zurücklegen (bild = sein <img>, wird wiederverwendet) */
function stapelWeg(s) {
  const b = document.querySelector(`#tray .tray-st[data-s="${CSS.escape(s)}"]`), n = freieSticker().length;
  if (b) b.remove();
  if (!n || !b) { zeichneStapel(); if (masseNeu()) zeichneBuch(); return; }
  document.querySelector('#tray .tray-kopf b').textContent = `Deine Sticker (${n})`;
}
function stapelDazu(s, bild) {
  const row = document.querySelector('#tray .tray-row'), frei = freieSticker();
  if (!row) { zeichneStapel(); if (masseNeu()) zeichneBuch(); return; }
  const b = knoten(stapelKnopfHTML(s)), i = frei.indexOf(s), nach = frei.slice(i + 1).map(x => row.querySelector(`.tray-st[data-s="${CSS.escape(x)}"]`)).find(Boolean);
  if (bild) {
    ['class', 'style', 'data-act', 'data-s'].forEach(a => bild.removeAttribute(a));
    bild.alt = '';
    b.firstElementChild.replaceWith(bild);
  }
  row.insertBefore(b, nach || null);
  document.querySelector('#tray .tray-kopf b').textContent = `Deine Sticker (${frei.length})`;
}

/* ---- Blättern (neu 2026-10-28): das Blatt hebt sich vom Buchrücken, steht senkrecht und legt sich auf die andere Seite.
   Das sind zwei flache Hälften nacheinander (.halb.hoch, dann .halb.runter) statt einer 3D-Karte mit Vorder- und Rückseite:
   bei der Karte liess Safari auf dem iPad die Rückseite gespiegelt durchscheinen und zeigte am Ende kurz die alte Seite.
   Nichts wird neu gezeichnet: die aufgeschlagene Seite wird zum Blatt, das Blatt am Ende wieder zur Seite. Neue Seiten werden
   vorher fertig geladen (decode), damit kein Bild und kein Sticker nachträglich aufblitzt. danach = was nach dem Blättern kommt. */
const BLATT_MS = 700;                          // beide Hälften zusammen (style.css: je .35s)
function blaettern(d, danach) {
  if (BK.busy || BK.drag || !BK.L) return;
  const L = BK.L, p0 = S.buch.p;
  let p1;
  if (L.doppel) {
    const s1 = blattVon(p0) + d;
    if (s1 < 0 || s1 > LETZTES_BLATT) return;
    p1 = s1 === 0 ? 0 : 2 * s1 - 1;
  } else {
    p1 = p0 + d;
    if (p1 < 0 || p1 >= BUCH_SEITEN) return;
  }
  waehle(null);
  S.buch.p = p1;
  save();
  if (reduced()) { Sound.fx('blaettern'); zeichneBuch(); if (danach) danach(); return; }
  BK.busy = true;
  const nr = ++BK.nr, book = document.getElementById('book'), spread = book.querySelector('.spread');
  book.classList.add('blaettert');
  // hoch = aufgeschlagene Seite, die sich hebt; unten = neue Seite darunter; runter = Seite, die sich hinlegt und am Ende ersetzt
  let hoch = null, unten = null, runter = null, ersetzt = null, art;
  if (L.doppel) {
    const [l1, r1] = seitenVon(blattVon(p1)), [links, rechts] = spread.children;
    if (d > 0) { art = 'vor'; hoch = rechts; unten = knoten(seiteHTML(r1, 'rechts')); runter = knoten(seiteHTML(l1, 'links')); ersetzt = links; }
    else { art = 'zurueck'; hoch = links; unten = knoten(seiteHTML(l1, 'links')); runter = knoten(seiteHTML(r1, 'rechts')); ersetzt = rechts; }
  } else if (d > 0) { art = 'weg'; hoch = spread.firstElementChild; unten = knoten(seiteHTML(p1, 'solo')); }
  else { art = 'her'; runter = knoten(seiteHTML(p1, 'solo')); ersetzt = spread.firstElementChild; }
  bilderBereit([unten, runter]).then(() => {
    if (nr !== BK.nr || !book.isConnected) return;
    Sound.fx('blaettern');
    const leaf = document.createElement('div');
    leaf.className = `leaf ${art}`;
    if (hoch) { hoch.replaceWith(unten); leaf.appendChild(document.createElement('div')).className = 'halb hoch'; leaf.lastChild.appendChild(hoch); }
    if (runter) { leaf.appendChild(document.createElement('div')).className = 'halb runter'; leaf.lastChild.appendChild(runter); }
    book.appendChild(leaf);
    if (L.doppel) book.classList.toggle('zu', blattVon(p1) === 0);              // zuklappen / aufklappen: das Buch rutscht in die Mitte
    document.getElementById('buch-wo').textContent = woText(L.doppel, blattVon(p1));
    let fertig = false;
    const ende = () => {
      if (fertig || nr !== BK.nr) return;
      fertig = true;
      if (runter) ersetzt.replaceWith(runter);
      leaf.remove();
      book.classList.remove('blaettert');
      BK.busy = false;
      buchLeiste();
      if (danach && view.name === 'buch') danach();
    };
    const letzte = leaf.lastChild;
    leaf.addEventListener('animationend', e => { if (e.target === letzte && e.animationName.startsWith('halb')) ende(); });
    setTimeout(ende, BLATT_MS + 250);                                          // falls kein animationend kommt
  });
}
/* Wartet, bis die Bilder der Seiten entpackt sind (höchstens ms), damit sie beim Blättern gleich ganz da sind */
function bilderBereit(seiten, ms = 400) {
  const warte = i => (i.decode ? i.decode().catch(() => {}) : Promise.resolve());
  const jobs = [];
  seiten.filter(Boolean).forEach(e => {
    e.querySelectorAll('img').forEach(i => jobs.push(warte(i)));
    const bg = /url\(["']?([^"')]+)/.exec(e.style.backgroundImage || '');
    if (bg) { const i = new Image(); i.src = bg[1]; jobs.push(warte(i)); }
  });
  return Promise.race([Promise.all(jobs), new Promise(res => setTimeout(res, ms))]);
}

/* ---- Einkleben, auswählen, drehen, ablösen. Seit 2026-10-28 ohne das Buch neu zu zeichnen (sonst blitzten auf dem iPad alle
   Sticker kurz auf): das Bild, das man gezogen oder angetippt hat, wird selbst zum eingeklebten Sticker. ---- */
function einkleben(s, p, x, y, r, bild) {
  const alt = S.buch.placed.findIndex(i => i.s === s), neu = alt < 0;
  const item = neu ? { s } : S.buch.placed.splice(alt, 1)[0];
  Object.assign(item, { p, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, r: Math.round(r) });
  S.buch.placed.push(item);                    // zuletzt geklebt = zuoberst
  save();
  Sound.fx('kleben');
  BK.sel = null;
  const e = pstEl(s) || (bild && bild.tagName === 'IMG' ? bild : knoten(pstHTML(item)));
  e.className = 'pst';
  e.style.cssText = `left:${item.x}%;top:${item.y}%;--r:${item.r}deg`;
  Object.assign(e.dataset, { act: 'pst', s });
  e.alt = stickerName(s);
  e.draggable = false;
  const seite = document.querySelector(`#book .spread .page[data-p="${p}"]`);
  if (seite) seite.insertBefore(e, seite.querySelector('.falz'));
  if (neu) stapelWeg(s);
  if (!reduced()) { void e.offsetWidth; e.classList.add('klebt'); }
  buchLeiste();
  if (neu && eingeklebt().length === 1) say('buch_klebt');        // beim allerersten Sticker
}
/* Antippen im Stapel: auf die sichtbare Seite mit weniger Stickern, ungefähr in die Mitte */
function antippenEinkleben(s) {
  if (BK.schluck) { BK.schluck = false; return; }           // das »click« am Ende von Ziehen/Scrollen (Maus) zählt nicht
  if (BK.busy || BK.drag) return;
  if (S.buch.p === 0) { blaettern(1, () => antippenEinkleben(s)); return; }
  const ziel = [...document.querySelectorAll('#book .spread .page[data-p]')].map(e => +e.dataset.p).filter(p => p > 0)
    .map(p => ({ p, n: S.buch.placed.filter(x => x.p === p).length })).sort((a, b) => a.n - b.n || b.p - a.p)[0];
  const b = document.querySelector(`#tray .tray-st[data-s="${CSS.escape(s)}"] img`);
  if (ziel) einkleben(s, ziel.p, 30 + Math.random() * 40, 30 + Math.random() * 40, Math.random() * 20 - 10, b);
}
function waehle(s) {
  BK.sel = s;
  document.querySelectorAll('#book .pst.sel').forEach(e => e.classList.remove('sel'));
  const el = s != null && pstEl(s);
  if (el) el.classList.add('sel'); else BK.sel = null;
  zeigeWerkzeug();
}
/* Die kleine Leiste über dem gewählten Sticker: drehen, ablösen */
function zeigeWerkzeug() {
  const t = document.getElementById('st-tools');
  if (!t) return;
  const el = BK.sel != null && pstEl(BK.sel);
  t.hidden = !el;
  if (!el) return;
  const r = el.getBoundingClientRect(), vw = document.documentElement.clientWidth;
  let top = r.top - t.offsetHeight - 10;
  if (top < 8) top = r.bottom + 10;
  t.style.left = `${Math.max(8, Math.min(vw - t.offsetWidth - 8, r.left + r.width / 2 - t.offsetWidth / 2))}px`;
  t.style.top = `${top}px`;
}
function drehen(d) {
  const x = S.buch.placed.find(i => i.s === BK.sel);
  if (!x) return;
  x.r = ((x.r + d + 540) % 360) - 180;
  save();
  sfx.tap();
  const el = pstEl(BK.sel);
  if (el) el.style.setProperty('--r', `${x.r}deg`);
  zeigeWerkzeug();
}
function abloesen(s, leise) {
  const k = S.buch.placed.findIndex(i => i.s === s);
  if (k < 0) return;
  S.buch.placed.splice(k, 1);
  save();
  if (leise) sfx.tap(); else Sound.fx('abloesen');
  BK.sel = null;
  const e = pstEl(s);
  stapelDazu(s, e);
  if (e && e.closest('#book')) e.remove();
  buchLeiste();
}

/* ---- Ziehen: mit einem Finger (oder der Maus) verschieben, ein zweiter Finger dreht.
   iPhone/iPad (2026-10-28): Safari nahm das Ziehen aus dem Stapel als Scrollen und brach es ab (pointercancel). Darum
   scrollt der Stapel jetzt selbst (touch-action: none in style.css): seitwärts wischen = Stapel scrollen, nach oben ziehen =
   Sticker nehmen. Solange etwas gezogen wird, verhindert touchmove zusätzlich jedes Scrollen der Seite. ---- */
const punkt = e => ({ x: e.clientX, y: e.clientY });
app.addEventListener('pointerdown', e => {
  if (view.name !== 'buch') return;
  BK.schluck = false;
  if (BK.busy) return;
  if (BK.drag) {                                // zweiter Finger: ab jetzt wird gedreht
    if (e.pointerType === 'touch' && BK.drag.ptr.size === 1) { BK.drag.ptr.set(e.pointerId, punkt(e)); BK.drag.w0 = null; }
    return;
  }
  if (BK.roll) return;
  stoppeRollen();
  const tray = e.target.closest('.tray-st'), pst = e.target.closest('#book .spread .pst'), row = e.target.closest('.tray-row');
  if (tray) BK.pend = { art: 'neu', s: tray.dataset.s, el: tray, row, id: e.pointerId, ...punkt(e) };
  else if (pst) { BK.pend = { art: 'zug', s: pst.dataset.s, el: pst, id: e.pointerId, ...punkt(e) }; e.preventDefault(); }
  else if (row) rollStart({ row, id: e.pointerId, ...punkt(e) });
  else if (e.target.closest('#book')) BK.swipe = { id: e.pointerId, ...punkt(e) };
  if (!e.target.closest('.st-tools, #book .pst')) waehle(null);
});
window.addEventListener('pointermove', e => {
  if (view.name !== 'buch') return;
  const pd = BK.pend;
  if (pd && e.pointerId === pd.id) {
    const dx = e.clientX - pd.x, dy = e.clientY - pd.y;
    if (pd.art === 'neu') {             // schräg nach oben (auch flach, zum Buch auf dem breiten iPad): den Sticker nehmen
      const weit = Math.hypot(dx, dy), scrollt = pd.row && pd.row.scrollWidth > pd.row.clientWidth + 2;
      if (weit > 8 && (!scrollt || -dy >= Math.abs(dx) * 0.35 || (weit > 24 && dy < 0))) ziehStart(pd, e);
      else if ((Math.abs(dx) > 10 && Math.abs(dy) < Math.abs(dx) * 0.35) || weit > 24) { BK.pend = null; rollStart(pd); }   // seitwärts: Stapel scrollen
    } else if (Math.hypot(dx, dy) > 6) ziehStart(pd, e);
  }
  if (BK.roll && e.pointerId === BK.roll.id) rollen(e);
  const dr = BK.drag;
  if (dr && dr.ptr.has(e.pointerId)) { dr.ptr.set(e.pointerId, punkt(e)); ziehBewegen(); }
}, { passive: true });
// Safari (iPhone/iPad): solange im Buch etwas gezogen, gewischt oder gescrollt wird, nicht die Seite verschieben
document.addEventListener('touchmove', e => {
  if (view.name === 'buch' && (BK.pend || BK.drag || BK.roll || BK.swipe) && e.cancelable) e.preventDefault();
}, { passive: false });
/* Den Stapel mit dem Finger scrollen, mit etwas Schwung beim Loslassen */
function rollStart(pd) { BK.roll = { id: pd.id, row: pd.row, x: pd.x, left: pd.row.scrollLeft, lx: pd.x, t: performance.now(), v: 0 }; }
function rollen(e) {
  const ro = BK.roll, t = performance.now(), dt = t - ro.t;
  if (dt > 0) ro.v = 0.7 * ((ro.lx - e.clientX) / dt) + 0.3 * ro.v;       // Pixel pro Millisekunde
  ro.t = t; ro.lx = e.clientX;
  ro.row.scrollLeft = ro.left - (e.clientX - ro.x);
}
function rollEnde() {
  const ro = BK.roll;
  BK.roll = null;
  BK.schluck = true;
  let v = performance.now() - ro.t > 90 ? 0 : ro.v, t0 = performance.now();
  const schritt = t => {
    const dt = t - t0; t0 = t;
    ro.row.scrollLeft += v * dt;
    v *= Math.pow(0.995, dt);
    BK.rollRaf = Math.abs(v) > 0.02 && ro.row.isConnected ? requestAnimationFrame(schritt) : 0;
  };
  if (Math.abs(v) > 0.05) BK.rollRaf = requestAnimationFrame(schritt);
}
function stoppeRollen() { if (BK.rollRaf) cancelAnimationFrame(BK.rollRaf); BK.rollRaf = 0; }
function ziehStart(pd, e) {
  BK.pend = null;
  const zug = pd.art === 'zug', x = zug && S.buch.placed.find(i => i.s === pd.s);
  if (zug && !x) return;
  const size = BK.L.pw * STICKER_BREITE;
  let off = { x: 0, y: size * 0.3 };          // ein neuer Sticker hängt etwas über dem Finger, damit man ihn sieht
  if (zug) {
    const r = pd.el.getBoundingClientRect();
    off = { x: pd.x - (r.left + r.width / 2), y: pd.y - (r.top + r.height / 2) };
    pd.el.style.visibility = 'hidden';
  } else pd.el.classList.add('weg');
  const g = document.createElement('img');
  g.className = 'ghost'; g.alt = ''; g.draggable = false; g.src = stickerBild(pd.s);
  g.style.width = `${size}px`;
  fxRoot.appendChild(g);
  BK.drag = { art: pd.art, s: pd.s, el: pd.el, g, off, r: zug ? x.r : Math.round(Math.random() * 16 - 8),
    ptr: new Map([[pd.id, punkt(e)]]), haupt: pd.id, w0: null, r0: 0, cx: 0, cy: 0 };
  waehle(null);
  Sound.fx('abloesen');
  ziehBewegen();
}
function ziehBewegen() {
  const dr = BK.drag, pts = [...dr.ptr.values()];
  if (pts.length >= 2) {
    const w = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x) * 180 / Math.PI;
    if (dr.w0 == null) { dr.w0 = w; dr.r0 = dr.r; }
    dr.r = Math.round(dr.r0 + w - dr.w0);
  }
  const h = dr.ptr.get(dr.haupt) || pts[0];
  dr.cx = h.x - dr.off.x; dr.cy = h.y - dr.off.y;
  dr.g.style.transform = `translate3d(${dr.cx}px, ${dr.cy}px, 0) translate(-50%, -50%) rotate(${dr.r}deg) scale(1.08)`;
  const ziel = zielBei(dr.cx, dr.cy, dr.art);
  document.querySelectorAll('#buch .ziel').forEach(e => { if (e !== ziel) e.classList.remove('ziel'); });
  if (ziel) ziel.classList.add('ziel');
}
/* Wohin würde der Sticker jetzt geklebt? Eine Seite (nicht der Umschlag) – oder zurück in den Stapel */
function zielBei(x, y, art) {
  for (const e of document.elementsFromPoint(x, y)) {
    if (e.closest('#tray')) return art === 'zug' ? document.getElementById('tray') : null;
    const p = e.closest('#book .spread .page[data-p]');
    if (p && +p.dataset.p > 0) return p;
  }
  return null;
}
function buchLos(e) {
  if (view.name !== 'buch') return;
  if (BK.pend && e.pointerId === BK.pend.id) BK.pend = null;          // nur getippt: das macht »click«
  if (BK.roll && e.pointerId === BK.roll.id) rollEnde();
  const sw = BK.swipe;
  if (sw && e.pointerId === sw.id) {
    BK.swipe = null;
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
    if (e.type === 'pointerup' && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) blaettern(dx < 0 ? 1 : -1);
  }
  const dr = BK.drag;
  if (!dr || !dr.ptr.has(e.pointerId)) return;
  dr.ptr.delete(e.pointerId);
  dr.w0 = null;
  if (e.pointerId === dr.haupt && dr.ptr.size) {      // der erste Finger ist weg: der andere zieht weiter
    const [id, p] = [...dr.ptr.entries()][0];
    dr.haupt = id; dr.off = { x: p.x - dr.cx, y: p.y - dr.cy };
  }
  if (!dr.ptr.size) ziehEnde(e.type === 'pointercancel');
}
window.addEventListener('pointerup', buchLos);
window.addEventListener('pointercancel', buchLos);
function ziehEnde(abbruch) {
  const dr = BK.drag;
  BK.drag = null;
  BK.schluck = true;
  document.querySelectorAll('#buch .ziel').forEach(e => e.classList.remove('ziel'));
  const ziel = abbruch ? null : zielBei(dr.cx, dr.cy, dr.art);
  if (ziel && ziel.dataset.p) {                                        // der gezogene Sticker (bzw. sein Bild) wird eingeklebt
    const r = ziel.getBoundingClientRect(), fit = v => Math.min(94, Math.max(6, v));
    if (dr.art === 'zug') dr.g.remove();
    einkleben(dr.s, +ziel.dataset.p, fit((dr.cx - r.left) / r.width * 100), fit((dr.cy - r.top) / r.height * 100), dr.r, dr.art === 'zug' ? dr.el : dr.g);
    return;
  }
  dr.g.remove();
  if (ziel && dr.art === 'zug') abloesen(dr.s, true);         // in den Stapel gezogen = abgelöst
  else {                                                         // daneben: alles bleibt, wie es war
    dr.el.style.visibility = '';
    dr.el.classList.remove('weg');
    sfx.tap();
  }
}
window.addEventListener('resize', () => { if (view.name === 'buch' && !BK.busy && !BK.drag && masseNeu()) zeichneBuch(); });

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
      <p class="set-note">${S.rounds} ${S.rounds === 1 ? 'Runde' : 'Runden'} gerechnet · ${gamesPlayed()} ${gamesPlayed() === 1 ? 'Spiel' : 'Spiele'} gespielt · ${S.stickers.length} von ${ALL} Stickern.</p>
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
  <div class="sheet-body sticker-big">${stickerImg(s, STICKER[s])}${GLITZ.has(s) ? `<p class="sb-wofuer">Glitzer-Sticker für: ${WOFUER[s]}</p>` : ''}</div>`;
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
    case 'key': if (view.name === 'mauer') mauerType(+b.dataset.v); else typeDigit(+b.dataset.v); break;
    case 'del': if (view.name === 'mauer') mauerDel(); else deleteDigit(); break;
    case 'ok': if (view.name === 'mauer') mauerSubmit(); else submit(); break;
    case 'choice': if (view.name === 'mauer') mauerSubmit(+b.dataset.v); else submit(+b.dataset.v); break;
    case 'next': Sound.stop(); advance(); break;
    case 'hint': showHint(true); break;
    case 'replay': if (Q) Sound.say(R.voice(cur())); break;
    case 'quit':
      sfx.tap();
      openSheet('quit', confirmHTML('Runde beenden?', 'Dann gibt es für diese Runde keinen Sticker.', 'Beenden', 'quit-yes'));
      break;
    case 'quit-yes': Q = null; Sound.stop(); nav('home'); break;
    case 'spiele':
      sfx.tap(); nav('spiele');
      if (!S.spieleSeen) { S.spieleSeen = true; save(); say('spiele'); }   // die Erklärung nur beim ersten Mal
      break;
    case 'level': gs(b.dataset.g).level = b.dataset.v; save(); sfx.tap(); render(); break;
    case 'spiel': sfx.tap(); startGame(b.dataset.g, b.dataset.level); break;
    case 'brick': mauerSelect(b.dataset.k); break;
    case 'mhint': mauerHint(); break;
    case 'cell': schatzTap(+b.dataset.n); break;
    case 'fish': fishTap(+b.dataset.i); break;
    case 'schatz-weiter': sfx.tap(); finishGame(); break;
    case 'greplay':
      if (G && G.g === 'schatz') Sound.say(G.s.aufgaben[G.i].voice);
      else if (G && G.g === 'fische') Sound.say(R.voice(G.list[G.i]));
      break;
    case 'gquit':
      sfx.tap();
      openSheet('quit', confirmHTML('Spiel beenden?', 'Dann gibt es für dieses Spiel keinen Sticker.', 'Beenden', 'gquit-yes'));
      break;
    case 'gquit-yes': stopGame(); nav('spiele'); break;
    case 'buch': sfx.tap(); oeffneBuch(); break;
    case 'buch-zu': sfx.tap(); nav(BK.from); break;
    case 'blatt': blaettern(+b.dataset.d); break;
    case 'buch-auf': blaettern(1); break;
    case 'tray-st': antippenEinkleben(b.dataset.s); break;
    case 'pst': sfx.tap(); waehle(BK.sel === b.dataset.s ? null : b.dataset.s); break;
    case 'st-rot': drehen(+b.dataset.d); break;
    case 'st-weg': if (BK.sel != null) abloesen(BK.sel); break;
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
      openSheet('reset', confirmHTML('Alles zurücksetzen?', 'Alle Sterne, alle Spiel-Rekorde, alle Sticker im Album und das Sammelbuch werden gelöscht. Das lässt sich nicht rückgängig machen.', 'Zurücksetzen', 'reset-yes'));
      break;
    case 'reset-yes':
      S.stufen = {}; S.stickers = []; S.drei = []; S.spiele = {}; S.buch = buchLaden(null); S.rounds = 0; save();
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
  if (view.name === 'buch' && !sheetOpen) {
    if (e.key === 'ArrowRight') { blaettern(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { blaettern(-1); e.preventDefault(); }
    else if (e.key === 'Escape') waehle(null);
    else if ((e.key === 'Delete' || e.key === 'Backspace') && BK.sel != null) { abloesen(BK.sel); e.preventDefault(); }
    return;
  }
  if (view.name === 'mauer' && G && !sheetOpen) {
    if (/^[0-9]$/.test(e.key) && S.settings.answer === 'tippen') { mauerType(+e.key); e.preventDefault(); }
    else if (e.key === 'Backspace') { mauerDel(); e.preventDefault(); }
    else if (e.key === 'Enter') { mauerSubmit(); e.preventDefault(); }
    return;
  }
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
    if (['quiz', 'result', 'spielende', 'buch', ...GAME_VIEWS].includes(view.name)) reloadPending = true; else location.reload();
  });
}
})();
