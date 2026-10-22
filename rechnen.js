/* Rechentiger – die Rechnungen: Stufen, Aufgaben, Rechenwege, Auswahl-Antworten.
   Ohne Bildschirm-Code, damit Scripts/test.mjs alles mit Node prüfen kann (window.Rechnen bzw. module.exports). */
(function (root) {
'use strict';

/* ================================================================== Stufen
   Zahlenraum bis 100, 2. Klasse (Lehrplan 21: Addition und Subtraktion, Zehnerübergang, Ergänzen).
   Jede Stufe: Name, Beispiel, Erklärung, Farbe, und ein Erzeuger gen(op, rnd) -> { a, op, b, c } (a op b = c). */
const STUFEN = [
  { n: 1, name: 'Ganze Zehner', bsp: '30 + 40', info: 'Nur mit Zehnerzahlen: 30 + 40, 90 − 60.', gen: zehner },
  { n: 2, name: 'Zehner und Einer', bsp: '40 + 7', info: 'Zehner und Einer zusammensetzen und trennen: 40 + 7, 47 − 7.', gen: zehnerEiner },
  { n: 3, name: 'Einer dazu und weg', bsp: '34 + 5', info: 'Einer plus und minus, ohne über den Zehner zu gehen: 34 + 5, 57 − 4.', gen: einerOhne },
  { n: 4, name: 'Bis zum Zehner', bsp: '36 + 4', info: 'Genau bis zum nächsten Zehner und vom Zehner weg: 36 + 4, 40 − 3.', gen: bisZehner },
  { n: 5, name: 'Über den Zehner', bsp: '38 + 5', info: 'Einer plus und minus mit Zehnerübergang: 38 + 5, 42 − 7.', gen: einerMit },
  { n: 6, name: 'Zehner dazu und weg', bsp: '34 + 20', info: 'Ganze Zehner plus und minus: 34 + 20, 76 − 30.', gen: zehnerDazu },
  { n: 7, name: 'Zwei Zahlen leicht', bsp: '34 + 25', info: 'Zwei zweistellige Zahlen ohne Zehnerübergang: 34 + 25, 78 − 46.', gen: zweiOhne },
  { n: 8, name: 'Zwei Zahlen schwer', bsp: '38 + 47', info: 'Zwei zweistellige Zahlen mit Zehnerübergang: 38 + 47, 72 − 38.', gen: zweiMit },
  { n: 9, name: 'Ergänzen bis 100', bsp: '65 + _ = 100', info: 'Wie viel fehlt bis 100? 65 + _ = 100, 100 − 35.', gen: bis100 },
  { n: 10, name: 'Alles gemischt', bsp: 'Stufe 1 bis 9', info: 'Rechnungen aus allen Stufen durcheinander.', gen: null },
];

const randInt = (rnd, lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
const pick = (rnd, a) => a[Math.floor(rnd() * a.length)];
const ones = x => x % 10;

function zehner(op, rnd) {
  if (op === '+') { const a = randInt(rnd, 1, 8) * 10; return { a, b: randInt(rnd, 1, 10 - a / 10) * 10 }; }
  const a = randInt(rnd, 3, 10) * 10; return { a, b: randInt(rnd, 1, a / 10 - 1) * 10 };
}
function zehnerEiner(op, rnd) {
  const t = randInt(rnd, 1, 9) * 10, e = randInt(rnd, 1, 9);
  if (op === '+') return pick(rnd, [0, 0, 1]) ? { a: e, b: t } : { a: t, b: e };
  return pick(rnd, [0, 1]) ? { a: t + e, b: e } : { a: t + e, b: t };
}
function einerOhne(op, rnd) {
  for (;;) {
    const a = randInt(rnd, 11, 98), b = randInt(rnd, 1, 9);
    if (op === '+' && ones(a) + b <= 9 && ones(a) > 0) return { a, b };
    if (op === '-' && ones(a) > b) return { a, b };
  }
}
function bisZehner(op, rnd) {
  if (op === '+') { const a = randInt(rnd, 11, 99); if (ones(a) === 0) return bisZehner(op, rnd); return { a, b: 10 - ones(a) }; }
  return { a: randInt(rnd, 2, 10) * 10, b: randInt(rnd, 1, 9) };
}
function einerMit(op, rnd) {
  for (;;) {
    const a = randInt(rnd, 11, 98), b = randInt(rnd, 2, 9);
    if (op === '+' && ones(a) > 0 && ones(a) + b > 10 && a + b <= 100) return { a, b };
    if (op === '-' && ones(a) > 0 && b > ones(a) && a - b >= 1) return { a, b };
  }
}
function zehnerDazu(op, rnd) {
  for (;;) {
    const a = randInt(rnd, 11, 98), b = randInt(rnd, 1, 8) * 10;
    if (ones(a) === 0) continue;
    if (op === '+' && a + b <= 99) return { a, b };
    if (op === '-' && a - b >= 1) return { a, b };
  }
}
function zweiOhne(op, rnd) {
  for (;;) {
    const a = randInt(rnd, 12, 98), b = randInt(rnd, 11, 87);
    if (ones(b) === 0 || ones(a) === 0) continue;
    if (op === '+' && ones(a) + ones(b) <= 9 && a + b <= 99) return { a, b };
    if (op === '-' && ones(a) > ones(b) && a - b >= 10) return { a, b };
  }
}
function zweiMit(op, rnd) {
  for (;;) {
    const a = randInt(rnd, 12, 98), b = randInt(rnd, 11, 89);
    if (ones(b) === 0) continue;
    if (op === '+' && ones(a) > 0 && ones(a) + ones(b) > 10 && a + b <= 100) return { a, b };
    if (op === '-' && ones(a) < ones(b) && a - b >= 1 && a > 20) return { a, b };
  }
}
function bis100(op, rnd) {
  const x = rnd() < 0.3 ? randInt(rnd, 1, 9) * 10 : randInt(rnd, 11, 99);
  return op === '+' ? { a: x, b: 100 - x, gap: true } : { a: 100, b: x };
}

/* ============================================================ Runde bauen
   opts: { stufe, ops: 'beides'|'plus'|'minus', luecke: bool, length, rnd }
   Aufgabe: { a, op, b, c, gap, stufe, key } – gap = die Lücke ist b (a op _ = c). */
function makeTask(stufe, op, luecke, rnd) {
  const s = STUFEN[stufe - 1];
  const t = s.gen(op, rnd);
  const task = { a: t.a, op, b: t.b, c: op === '+' ? t.a + t.b : t.a - t.b, stufe };
  // Lücken: Stufe 9 (Ergänzen) bringt sie selbst mit; sonst etwa jede dritte, wenn eingeschaltet (nicht bei Stufe 1/2)
  task.gap = !!t.gap || (luecke && stufe >= 3 && stufe !== 9 && rnd() < 0.34);
  if (stufe === 9 && luecke && op === '-' && rnd() < 0.5) task.gap = true;
  task.key = `${task.a}${op}${task.b}${task.gap ? '?' : ''}`;
  return task;
}

function opsFor(ops) { return ops === 'plus' ? ['+'] : ops === 'minus' ? ['-'] : ['+', '-']; }

function buildRound(opts) {
  const rnd = opts.rnd || Math.random;
  const ops = opsFor(opts.ops);
  // Plus und Minus etwa gleich oft, in zufälliger Reihenfolge
  const opList = shuffle(Array.from({ length: opts.length }, (_, i) => ops[i % ops.length]), rnd);
  const list = [], seen = new Set();
  let guard = 0;
  while (list.length < opts.length && guard++ < 500) {
    const stufe = opts.stufe === 10 ? mixStufe(rnd) : opts.stufe;
    const op = opList[list.length];
    const t = makeTask(stufe, op, opts.luecke, rnd);
    if (seen.has(t.key)) continue;
    const prev = list[list.length - 1];
    if (prev && prev.a === t.a && prev.op === t.op && t.stufe !== 9) continue;   // nicht zweimal gleich anfangen (ausser 100 − …)
    seen.add(t.key);
    list.push(t);
  }
  return list;
}
/* Gemischt: schwerere Stufen etwas häufiger */
function mixStufe(rnd) {
  const w = [1, 1, 1.5, 1.5, 2.5, 2, 2.5, 3, 2];
  let x = rnd() * w.reduce((s, v) => s + v, 0);
  for (let i = 0; i < w.length; i++) { x -= w[i]; if (x < 0) return i + 1; }
  return 9;
}

/* ========================================================== Antwort, Text */
const answerOf = t => (t.gap ? t.b : t.c);
const SIGN = { '+': '+', '-': '−' };
function parts(t) { return t.gap ? [t.a, SIGN[t.op], null, '=', t.c] : [t.a, SIGN[t.op], t.b, '=', null]; }
function text(t) { return parts(t).map(p => (p === null ? '_' : p)).join(' '); }
/* Was Tiko sagt: Dateinamen in audio/ (siehe Scripts/stimme.py) */
function voice(t) {
  const start = `a_${t.a}_${t.op === '+' ? 'plus' : 'minus'}`;
  return t.gap ? [start, 'wieviel', `z_${t.c}`] : [start, `z_${t.b}`];
}

/* ============================================================== Rechenweg
   Schritte wie im Schweizer Zahlenbuch: zuerst bis zum Zehner bzw. zuerst die Zehner, dann die Einer.
   Der letzte Schritt bleibt offen (»?«) – den rechnet das Kind selbst.
   Ergebnis: { tipp: 'tipp_…' (Tikos Satz), steps: [[x, op, y, z], …], sum: [Teile] | null } */
function weg(t) {
  if (t.gap) return wegLuecke(t);
  const { a, b, op } = t;
  const steps = [];
  if (op === '+') {
    if (b % 10 === 0 || b < 10 && ones(a) + b <= 10 || a % 10 === 0 && b < 10) return { tipp: 'tipp_bild', steps: [] };
    if (b < 10) {                                   // 38 + 5: 38 + 2 = 40, 40 + 3 = 43
      const fill = 10 - ones(a), z = a + fill;
      steps.push([a, '+', fill, z], [z, '+', b - fill, null]);
      return { tipp: 'tipp_zehner', steps };
    }
    const tens = b - ones(b), mid = a + tens;        // 34 + 25: 34 + 20 = 54, 54 + 5 = 59
    steps.push([a, '+', tens, mid]);
    if (ones(mid) + ones(b) > 10) { const fill = 10 - ones(mid); steps.push([mid, '+', fill, mid + fill], [mid + fill, '+', ones(b) - fill, null]); }
    else steps.push([mid, '+', ones(b), null]);
    return { tipp: 'tipp_zerlegen', steps };
  }
  if (b % 10 === 0 || b < 10 && ones(a) >= b || a % 10 === 0 && b < 10) return { tipp: 'tipp_bild', steps: [] };
  if (b < 10) {                                     // 42 − 7: 42 − 2 = 40, 40 − 5 = 35
    const down = ones(a), z = a - down;
    steps.push([a, '−', down, z], [z, '−', b - down, null]);
    return { tipp: 'tipp_zehner', steps };
  }
  const tens = b - ones(b), mid = a - tens;          // 72 − 38: 72 − 30 = 42, 42 − 2 = 40, 40 − 6 = 34
  steps.push([a, '−', tens, mid]);
  if (ones(mid) < ones(b) && ones(mid) > 0) { const down = ones(mid); steps.push([mid, '−', down, mid - down], [mid - down, '−', ones(b) - down, null]); }
  else steps.push([mid, '−', ones(b), null]);
  return { tipp: 'tipp_zerlegen', steps };
}
/* Lücke: vom Kleineren zum Grösseren hochzählen und die Sprünge zusammenzählen.
   Ohne Zehnerübergang zuerst die Zehner: 34 + _ = 59 → 34 + 20 = 54, 54 + 5 = 59 → 20 + 5.
   Mit Zehnerübergang zuerst bis zum Zehner: 65 + _ = 100 → 65 + 5 = 70, 70 + 30 = 100 → 5 + 30.
   Minus wird umgekehrt: 74 − _ = 38 → 38 + _ = 74. Bei nur einem Sprung hilft das Bild besser. */
function wegLuecke(t) {
  const from = t.op === '+' ? t.a : t.c, to = t.op === '+' ? t.c : t.a;
  const jumps = [];
  let x = from;
  if (ones(to) < ones(x)) { jumps.push(10 - ones(x)); x += 10 - ones(x); }
  const tens = Math.floor((to - x) / 10) * 10;
  if (tens > 0) { jumps.push(tens); x += tens; }
  if (to > x) jumps.push(to - x);
  if (jumps.length < 2) return { tipp: 'tipp_bild', steps: [] };
  const steps = [];
  x = from;
  jumps.forEach(j => { steps.push([x, '+', j, x + j]); x += j; });
  return { tipp: 'tipp_ergaenzen', steps, sum: jumps, umkehr: t.op === '-' ? [t.c, '+', '?', t.a] : null };
}

/* ========================================================= Auswahl-Antworten
   4 Möglichkeiten: richtige Antwort + typische Fehler (±1, ±10, Zehner vergessen, Ziffern vertauscht). */
function choices(t, rnd = Math.random) {
  const ans = answerOf(t);
  const cand = [ans + 10, ans - 10, ans + 1, ans - 1, ans + 2, ans - 2, ans + 9, ans - 9, ans + 11, ans - 11];
  if (ans >= 10 && ones(ans) !== Math.floor(ans / 10) && ones(ans) > 0) cand.unshift(ones(ans) * 10 + Math.floor(ans / 10));
  const ok = v => Number.isInteger(v) && v >= 0 && v <= 100 && v !== ans;
  const out = [ans];
  const first = cand.slice(0, 3).filter(ok);
  shuffle(first, rnd).forEach(v => { if (out.length < 3 && !out.includes(v)) out.push(v); });
  shuffle(cand.filter(ok), rnd).forEach(v => { if (out.length < 4 && !out.includes(v)) out.push(v); });
  for (let d = 3; out.length < 4; d++) [ans + d, ans - d].forEach(v => { if (out.length < 4 && ok(v) && !out.includes(v)) out.push(v); });
  return shuffle(out, rnd);
}
function shuffle(a, rnd = Math.random) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* Sterne für eine Runde: Anteil der Aufgaben, die beim ersten Versuch ohne Tipp stimmten */
function stars(firstRight, total) {
  const q = total ? firstRight / total : 0;
  return q >= 1 ? 3 : q >= 0.8 ? 2 : q >= 0.5 ? 1 : 0;
}

const api = { STUFEN, buildRound, makeTask, answerOf, parts, text, voice, weg, choices, stars, shuffle, mixStufe };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.Rechnen = api;
})(typeof window !== 'undefined' ? window : globalThis);
