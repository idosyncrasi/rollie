const LIMITS = { times: 20, count: 100, sides: 1_000_000, modifier: 1_000_000_000 };

const USAGE =
  'Use `[T x] [N]d S [kh K | kl K]   [+/- M]`, e.g. `2d20+30`, `2x2d20+30`, `4d6kh3`, `d6`, or `20`. ' +
    'Run `/rolliehelp` for details.';

  // Parses notation like "2x2d20kh1+30-2". Missing parts come back as null.
function parseNotation(input) {
  const text = input.trim().toLowerCase();
  const match = /^(?:(\d+)\s*x\s*)?(?:(\d*)d)?(\d+)(?:\s*(kh|kl)\s*(\d+))?((?:\s*[+-]\s*\d+)*)$/.exec(text);
  if (!match) return { error: USAGE };

  const hasD = match[2] !== undefined;
  const hasModifier = match[6].trim() !== '';
  if (!hasD && (match[4] || hasModifier)) return { error: USAGE };

  const modifier = (match[6].match(/[+-]\s*\d+/g) || []).reduce(
    (sum, term) => sum + Number(term.replace(/\s+/g, '')),
    0,
  );

  return {
    times: match[1] !== undefined ? Number(match[1]) : null,
    count: hasD && match[2] ? Number(match[2]) : hasD ? 1 : null,
    sides: Number(match[3]),
    keep: match[4] ? { type: match[4], n: Number(match[5]) } : null,
    modifier,
  };
}

function pick(name, fromNotation, fromOption) {
  if (fromNotation != null && fromOption != null && fromNotation !== fromOption) {
    return { error: `Conflicting ${name}: the dice text says ${fromNotation} but the ${name} option says ${fromOption}.` };
  }
  return { value: fromNotation ?? fromOption };
}

// Combines the dice text with the optional slash-command parameters into one validated spec.
function buildSpec({ dice, times, count, sides, modifier, advantage, keepHighest, keepLowest }) {
  let parsed = { times: null, count: null, sides: null, keep: null, modifier: 0 };
  if (dice) {
    parsed = parseNotation(dice);
    if (parsed.error) return parsed;
  }

  const t = pick('times', parsed.times, times);
  const c = pick('count', parsed.count, count);
  const s = pick('sides', parsed.sides, sides);
  for (const r of [t, c, s]) if (r.error) return r;

  if (s.value == null) return { error: 'Tell me what to roll: give `dice` (like `2d20+30`) or `sides`.' };

  const keepOptions = [keepHighest != null && { type: 'kh', n: keepHighest }, keepLowest != null && { type: 'kl', n: keepLowest }].filter(Boolean);
  if (keepOptions.length > 1) return { error: 'Use either `keep_highest` or `keep_lowest`, not both.' };
  if (parsed.keep && keepOptions.length) return { error: 'Keep rules were given twice (in the dice text and as an option).' };
  let keep = parsed.keep || keepOptions[0] || null;

  let diceCount = c.value ?? 1;
  if (advantage) {
    if (keep || diceCount !== 1) {
      return { error: 'Advantage/disadvantage rolls two dice and keeps one, so it cannot be combined with a dice count or keep rules.' };
    }
    diceCount = 2;
    keep = { type: advantage === 'advantage' ? 'kh' : 'kl', n: 1 };
  }

  const spec = {
    times: t.value ?? 1,
    count: diceCount,
    sides: s.value,
    keep,
    modifier: parsed.modifier + (modifier ?? 0),
    advantage: advantage || null,
  };

  if (spec.times < 1 || spec.times > LIMITS.times) return { error: `Times must be between 1 and ${LIMITS.times}.` };
  if (spec.count < 1 || spec.count > LIMITS.count) return { error: `Number of dice must be between 1 and ${LIMITS.count}.` };
  if (spec.sides < 1 || spec.sides > LIMITS.sides) return { error: `Number of sides must be between 1 and ${LIMITS.sides}.` };
  if (Math.abs(spec.modifier) > LIMITS.modifier) return { error: `Modifier must be at most ${LIMITS.modifier} in either direction.` };
  if (spec.keep && (spec.keep.n < 1 || spec.keep.n > spec.count)) {
    return { error: `You can only keep between 1 and ${spec.count} dice.` };
  }
  return spec;
}

function rollOnce(spec) {
  const dice = Array.from({ length: spec.count }, () => Math.floor(Math.random() * spec.sides) + 1);
  const kept = new Set(dice.keys());
  if (spec.keep) {
    const order = [...dice.keys()].sort((a, b) =>
      spec.keep.type === 'kh' ? dice[b] - dice[a] || a - b : dice[a] - dice[b] || a - b,
    );
    kept.clear();
    order.slice(0, spec.keep.n).forEach((i) => kept.add(i));
  }
  const subtotal = [...kept].reduce((sum, i) => sum + dice[i], 0);
  let natural = null;
  if (spec.sides === 20 && kept.size === 1) {
    const value = dice[[...kept][0]];
    if (value === 20) natural = 'crit';
    else if (value === 1) natural = 'fumble';
  }
  return { dice, kept, subtotal, total: subtotal + spec.modifier, natural };
}

function describeSpec(spec) {
  const keepText = spec.advantage
    ? ` (${spec.advantage})`
    : spec.keep
      ? `${spec.keep.type}${spec.keep.n}`
      : '';
  const mod = spec.modifier ? `${spec.modifier > 0 ? '+' : '-'}${Math.abs(spec.modifier)}` : '';
  const base = spec.advantage ? `1d${spec.sides}${mod}${keepText}` : `${spec.count}d${spec.sides}${keepText}${mod}`;
  return spec.times > 1 ? `${spec.times}x ${base}` : base;
}

function formatRoll(spec, result, { dc, withDice = true } = {}) {
  const sign = spec.modifier > 0 ? '+' : '-';
  const diceText = result.dice.map((v, i) => (result.kept.has(i) ? `${v}` : `~~${v}~~`)).join(', ');
  const single = result.dice.length === 1;
  const parts = [];
  if (!withDice) parts.push(`${result.subtotal}`);
  else parts.push(single ? diceText : `[${diceText}]`);
  if (spec.modifier) parts.push(`${sign} ${Math.abs(spec.modifier)}`);
  // A lone die with no modifier would just repeat itself, so show the total alone.
  const showBreakdown = parts.length > 1 || !single;
  let line = showBreakdown ? `${parts.join(' ')} = **${result.total}**` : `**${result.total}**`;
  if (result.natural === 'crit') line += ' 🌟 Natural 20!';
  if (result.natural === 'fumble') line += ' 💀 Natural 1!';
  if (dc != null) line += result.total >= dc ? ` ✅ Success (DC ${dc})` : ` ❌ Failure (DC ${dc})`;
  return line;
}

// Returns the reply text for a full roll, falling back to compact output if it would be too long.
function formatAll(spec, results, { label, dc }) {
  const header = `🎲 ${label ? `**${label}** — ` : ''}\`${describeSpec(spec)}\``;
  const build = (withDice) =>
    results.length === 1
      ? `${header}\n${formatRoll(spec, results[0], { dc, withDice })}`
      : `${header}\n${results.map((r, i) => `${i + 1}. ${formatRoll(spec, r, { dc, withDice })}`).join('\n')}`;

  let text = build(true);
  if (text.length > 2000) text = build(false);
  if (text.length > 2000) text = text.slice(0, 1990) + '…';
  return text;
}

// D&D-style ability modifier. Defaults to the 5e formula: floor((score - 10) / 2).
function abilityModifier(score, base = 10, per = 2) {
  return Math.floor((score - base) / per);
}

function signed(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

module.exports = {
  LIMITS,
  parseNotation,
  buildSpec,
  rollOnce,
  describeSpec,
  formatRoll,
  formatAll,
  abilityModifier,
  signed,
};
