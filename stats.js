const { SlashCommandBuilder } = require('discord.js');
const { buildSpec, rollOnce, abilityModifier, signed } = require('./dice');

const rolliestats = {
  data: new SlashCommandBuilder()
    .setName('rolliestats')
    .setDescription('Roll ability scores and show the modifier for each')
    .addStringOption((o) =>
      o
        .setName('method')
        .setDescription('How to roll each score (default: 4d6, drop the lowest)')
        .addChoices(
          { name: '4d6 drop lowest (standard)', value: '4d6kh3' },
          { name: '3d6 straight (classic)', value: '3d6' },
          { name: '2d6+6 (heroic)', value: '2d6+6' },
          { name: '5d6 keep best 3 (generous)', value: '5d6kh3' },
        ),
    )
    .addIntegerOption((o) =>
      o.setName('scores').setDescription('How many scores to roll (default 6)').setMinValue(1).setMaxValue(12),
    )
    .addIntegerOption((o) =>
      o.setName('base').setDescription('Homebrew: score that gives +0 (default 10)').setMinValue(0).setMaxValue(100),
    )
    .addIntegerOption((o) =>
      o.setName('per').setDescription('Homebrew: score points per +1 modifier (default 2)').setMinValue(1).setMaxValue(20),
    ),

  async execute(interaction) {
    const methodNotation = interaction.options.getString('method') ?? '4d6kh3';
    const total = interaction.options.getInteger('scores') ?? 6;
    const base = interaction.options.getInteger('base') ?? 10;
    const per = interaction.options.getInteger('per') ?? 2;
    const spec = buildSpec({ dice: methodNotation });

    const rows = Array.from({ length: total }, () => rollOnce(spec)).map((r) => {
      const dice = r.dice.map((v, i) => (r.kept.has(i) ? `${v}` : `~~${v}~~`)).join(', ');
      return { total: r.total, line: `[${dice}] = **${r.total}** → modifier **${signed(abilityModifier(r.total, base, per))}**` };
    });

    const sum = rows.reduce((s, r) => s + r.total, 0);
    const text =
      `📊 Ability scores (\`${methodNotation}\`, modifier = ⌊(score − ${base}) ÷ ${per}⌋)\n` +
      rows.map((r, i) => `${i + 1}. ${r.line}`).join('\n') +
      `\nTotal of scores: ${sum}`;
    await interaction.reply(text);
  },
};

const rolliemodifier = {
  data: new SlashCommandBuilder()
    .setName('rolliemodifier')
    .setDescription('Convert an ability score into its roll modifier')
    .addIntegerOption((o) =>
      o.setName('score').setDescription('The ability score, e.g. 16').setRequired(true).setMinValue(0).setMaxValue(1000),
    )
    .addIntegerOption((o) =>
      o.setName('base').setDescription('Homebrew: score that gives +0 (default 10)').setMinValue(0).setMaxValue(100),
    )
    .addIntegerOption((o) =>
      o.setName('per').setDescription('Homebrew: score points per +1 modifier (default 2)').setMinValue(1).setMaxValue(20),
    ),

  async execute(interaction) {
    const score = interaction.options.getInteger('score', true);
    const base = interaction.options.getInteger('base') ?? 10;
    const per = interaction.options.getInteger('per') ?? 2;
    const mod = abilityModifier(score, base, per);
    await interaction.reply(
      `🧮 A score of **${score}** gives a modifier of **${signed(mod)}**.\n` +
        `Formula: ⌊(${score} − ${base}) ÷ ${per}⌋ = ${signed(mod)}\n` +
        `Add ${signed(mod)} to rolls that use this stat, e.g. \`/rollie 1d20${mod ? signed(mod) : ''}\`.`,
    );
  },
};

module.exports = { rolliestats, rolliemodifier };
