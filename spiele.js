/* Rechentiger – Tikos Spiele: Zahlenmauer, Schatzsuche im Hunderterfeld, Fische fangen.
   Nur die Aufgaben, ohne Bildschirm-Code, damit Scripts/test.mjs alles mit Node prüfen kann (window.Spiele bzw. module.exports). */
(function (root) {
'use strict';
const R = root.Rechnen || require('./rechnen.js');

const LEVELS = ['leicht', 'mittel', 'schwer'];
const randInt = (rnd, lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
const pick = (rnd, a) => a[Math.floor(rnd() * a.length)];
const ones = x => x % 10;

/* ============================================================ Zahlenmauer
   Wie im Zahlenbuch: zwei Steine nebeneinander geben zusammen den Stein darüber.
   Reihe 0 = unten, Stein (r, i) = (r−1, i) + (r−1, i+1), Schlüssel »r,i«. Alle Zahlen 1–100.
   Leicht: 3 Steine unten, die sind gegeben – nur Plus, ohne Zehnerübergang.
   Mittel: 3 Steine unten, 3 Steine irgendwo gegeben – mindestens einmal Minus.
   Schwer: 4 Steine unten (10 Steine), 4 gegeben – mindestens zweimal Minus. */
const key = (r, i) => `${r},${i}`;
const val = (v, k) => { const [r, i] = k.split(',').map(Number); return v[r][i]; };
function bricks(n) {
  const out = [];
  for (let r = 0; r < n; r++) for (let i = 0; i < n - r; i++) out.push(key(r, i));
  return out;
}
function build(base) {
  const v = [base.slice()];
  for (let r = 1; r < base.length; r++) v.push(v[r - 1].slice(1).map((x, i) => v[r - 1][i] + x));
  return v;
}
function triangles(n) {           // [oben, links unten, rechts unten]
  const t = [];
  for (let r = 1; r < n; r++) for (let i = 0; i < n - r; i++) t.push([key(r, i), key(r - 1, i), key(r - 1, i + 1)]);
  return t;
}
/* Was lässt sich jetzt ausrechnen? Stein -> { op: '+', from: [links, rechts] } oder { op: '-', from: [oben, daneben] }.
   Plus geht vor (von unten nach oben ist leichter). */
function computable(n, known) {
  const out = new Map();
  for (const [top, l, r] of triangles(n)) if (!known.has(top) && known.has(l) && known.has(r)) out.set(top, { op: '+', from: [l, r] });
  for (const [top, l, r] of triangles(n)) {
    if (!known.has(top)) continue;
    if (!known.has(l) && known.has(r) && !out.has(l)) out.set(l, { op: '-', from: [top, r] });
    if (!known.has(r) && known.has(l) && !out.has(r)) out.set(r, { op: '-', from: [top, l] });
  }
  return out;
}
/* Lässt sich die Mauer aus den gegebenen Steinen Schritt für Schritt lösen? Und wie oft braucht es Minus? */
function solve(n, given) {
  const known = new Set(given);
  let minus = 0;
  for (;;) {
    const c = computable(n, known);
    if (!c.size) break;
    for (const [k, how] of c) { known.add(k); if (how.op === '-') minus++; }
  }
  return { all: known.size === n * (n + 1) / 2, minus };
}
function combos(arr, k) {
  const out = [];
  const rec = (s, cur) => {
    if (cur.length === k) { out.push(cur.slice()); return; }
    for (let i = s; i < arr.length; i++) { cur.push(arr[i]); rec(i + 1, cur); cur.pop(); }
  };
  rec(0, []);
  return out;
}
function baseFor(level, rnd) {
  if (level === 'leicht') return [randInt(rnd, 2, 35), randInt(rnd, 2, 30), randInt(rnd, 2, 35)];
  if (level === 'mittel') return [randInt(rnd, 3, 40), randInt(rnd, 3, 35), randInt(rnd, 3, 40)];
  return [randInt(rnd, 2, 20), randInt(rnd, 2, 16), randInt(rnd, 2, 16), randInt(rnd, 2, 20)];
}
function fits(v, level) {
  const top = v[v.length - 1][0];
  if (level === 'leicht') {
    for (let r = 1; r < v.length; r++) for (let i = 0; i < v[r].length; i++) if (ones(v[r - 1][i]) + ones(v[r - 1][i + 1]) > 9) return false;
    return top >= 30 && top <= 99;
  }
  return top <= 100 && top >= (level === 'mittel' ? 40 : 50);
}
function mauer(level, rnd = Math.random) {
  const n = level === 'schwer' ? 4 : 3;
  for (;;) {
    const v = build(baseFor(level, rnd));
    if (!fits(v, level)) continue;
    if (level === 'leicht') return { n, v, given: v[0].map((_, i) => key(0, i)), level };
    const ok = combos(bricks(n), n).filter(g => { const s = solve(n, g); return s.all && s.minus >= (level === 'schwer' ? 2 : 1); });
    if (ok.length) return { n, v, given: pick(rnd, ok), level };
  }
}
/* Ein Spiel = 3 Mauern mit verschiedenen Spitzen */
function mauerSpiel(level, rnd = Math.random) {
  const walls = [];
  while (walls.length < 3) {
    const w = mauer(level, rnd);
    if (!walls.some(x => x.v[x.n - 1][0] === w.v[w.n - 1][0])) walls.push(w);
  }
  return walls;
}
/* Tipp für einen Stein: welche zwei Steine, welche Rechnung (null = jetzt noch nicht ausrechenbar) */
function mauerHilfe(w, known, k) {
  const c = computable(w.n, known).get(k);
  return c ? { op: c.op, from: c.from, a: val(w.v, c.from[0]), b: val(w.v, c.from[1]), c: val(w.v, k) } : null;
}
/* Der nächste leere Stein, den man jetzt ausrechnen kann – von unten nach oben, von links nach rechts */
function mauerNaechster(w, known) {
  const c = [...computable(w.n, known).keys()];
  c.sort((x, y) => { const [r1, i1] = x.split(',').map(Number), [r2, i2] = y.split(',').map(Number); return r1 - r2 || i1 - i2; });
  return c[0] || null;
}

/* ============================================================ Schatzsuche
   Hunderterfeld 1–100 (Reihe 1–10, 11–20 …). 10 Ziele, gut verteilt. Jedes Feld gehört zum nächsten Ziel:
   so gibt es 10 Puzzleteile, und jedes gefundene Ziel deckt sein Teil des Schatzbilds auf.
   Leicht: Zahl finden. Mittel: Zahl ± 1, 2, 10, 20 finden. Schwer: Zahlen im Feld versteckt (nur die erste
   Reihe und die Zehner rechts stehen da), halb Zahlen, halb ± 1 und ± 10. */
const pos = n => [Math.floor((n - 1) / 10), (n - 1) % 10];      // [Reihe, Platz], beide 0–9
const anchor = n => n <= 10 || n % 10 === 0;
function spread(k, rnd, free) {
  for (let d = 2.9; ; d -= 0.1) {
    for (let tries = 0; tries < 60; tries++) {
      const out = [];
      for (let g = 0; g < 400 && out.length < k; g++) {
        const n = randInt(rnd, 1, 100);
        if (!free(n) || out.includes(n)) continue;
        const [r, c] = pos(n);
        if (out.every(m => { const [r2, c2] = pos(m); return Math.hypot(r - r2, c - c2) >= d; })) out.push(n);
      }
      if (out.length === k) return out;
    }
  }
}
function schatzAufgabe(z, level, rnd) {
  const calc = level === 'mittel' || (level === 'schwer' && rnd() < 0.5);
  if (!calc) return { n: z, text: String(z), voice: ['finde', `z_${z}`] };
  const steps = level === 'mittel' ? [1, 1, 2, 10, 10, 10, 20] : [1, 10, 10];
  for (;;) {
    const b = pick(rnd, steps), op = rnd() < 0.5 ? '+' : '-';
    const a = op === '+' ? z - b : z + b;
    if (a < 1 || a > 100) continue;
    return { n: z, a, op, b, text: `${a} ${op === '+' ? '+' : '−'} ${b}`, voice: ['finde', `a_${a}_${op === '+' ? 'plus' : 'minus'}`, `z_${b}`] };
  }
}
function schatz(level, rnd = Math.random) {
  const versteckt = level === 'schwer';
  const ziele = spread(10, rnd, n => !versteckt || !anchor(n));
  const teil = [null];                       // teil[n] = Index des Ziels, zu dessen Puzzleteil Feld n gehört
  for (let n = 1; n <= 100; n++) {
    const [r, c] = pos(n);
    let best = 0, bd = Infinity;
    ziele.forEach((z, i) => { const [r2, c2] = pos(z), d = (r - r2) ** 2 + (c - c2) ** 2; if (d < bd) { bd = d; best = i; } });
    teil.push(best);
  }
  return { level, versteckt, ziele, teil, aufgaben: ziele.map(z => schatzAufgabe(z, level, rnd)) };
}

/* ============================================================ Fische fangen
   10 Rechnungen wie auf dem Dschungelpfad; 4 Fische tragen die Auswahl-Zahlen (richtige + typische Fehler). */
const FISCH_STUFEN = { leicht: [1, 2, 3, 4], mittel: [3, 5, 6, 7], schwer: [5, 7, 8, 9] };
function fischRunde(level, ops = 'beides', rnd = Math.random, length = 10) {
  const opList = ops === 'plus' ? ['+'] : ops === 'minus' ? ['-'] : ['+', '-'];
  const order = R.shuffle(Array.from({ length }, (_, i) => opList[i % opList.length]), rnd);
  const out = [], seen = new Set();
  for (let g = 0; out.length < length && g < 500; g++) {
    const t = R.makeTask(pick(rnd, FISCH_STUFEN[level]), order[out.length], false, rnd);
    if (seen.has(t.key)) continue;
    seen.add(t.key);
    t.fische = R.choices(t, rnd);
    out.push(t);
  }
  return out;
}

const api = { LEVELS, key, val, bricks, computable, solve, mauer, mauerSpiel, mauerHilfe, mauerNaechster,
  pos, anchor, schatz, FISCH_STUFEN, fischRunde };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.Spiele = api;
})(typeof window !== 'undefined' ? window : globalThis);
