const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { LIMITS, buildSpec, rollOnce, formatAll } = require('./dice');

const buildData = (name) => new SlashCommandBuilder()
  .setName(name)
  .setDescription('Roll with options: times, dice count, sides, modifier, advantage, DC, and more')
  .addStringOption((o) =>
    o.setName('dice').setDescription('Optional notation like 2d20+30 or 2x2d20+30 (options can fill in the rest)'),
  )
  .addIntegerOption((o) =>
    o.setName('times').setDescription('How many times to repeat the roll').setMinValue(1).setMaxValue(LIMITS.times),
  )
  .addIntegerOption((o) =>
    o.setName('count').setDescription('How many dice to roll each time').setMinValue(1).setMaxValue(LIMITS.count),
  )
  .addIntegerOption((o) =>
    o.setName('sides').setDescription('Number of sides on each die').setMinValue(1).setMaxValue(LIMITS.sides),
  )
  .addIntegerOption((o) =>
    o
      .setName('modifier')
      .setDescription('Number added to each roll (negative to subtract)')
      .setMinValue(-LIMITS.modifier)
      .setMaxValue(LIMITS.modifier),
  )
  .addStringOption((o) =>
    o
      .setName('advantage')
      .setDescription('Roll two dice and keep the higher (advantage) or lower (disadvantage)')
      .addChoices({ name: 'Advantage', value: 'advantage' }, { name: 'Disadvantage', value: 'disadvantage' }),
  )
  .addIntegerOption((o) =>
    o.setName('keep_highest').setDescription('Keep only this many of the highest dice').setMinValue(1),
  )
  .addIntegerOption((o) =>
    o.setName('keep_lowest').setDescription('Keep only this many of the lowest dice').setMinValue(1),
  )
  .addIntegerOption((o) =>
    o.setName('dc').setDescription('Difficulty to beat; the bot reports success or failure (total >= DC)'),
  )
  .addStringOption((o) =>
    o.setName('label').setDescription('What the roll is for, e.g. "Stealth check" or "Greatsword damage"').setMaxLength(100),
  )
  .addBooleanOption((o) => o.setName('private').setDescription('Only show the result to you'));

async function execute(interaction) {
  const get = (name, type) => interaction.options[type](name);
  const spec = buildSpec({
    dice: get('dice', 'getString'),
    times: get('times', 'getInteger'),
    count: get('count', 'getInteger'),
    sides: get('sides', 'getInteger'),
    modifier: get('modifier', 'getInteger'),
    advantage: get('advantage', 'getString'),
    keepHighest: get('keep_highest', 'getInteger'),
    keepLowest: get('keep_lowest', 'getInteger'),
  });

  if (spec.error) {
    await interaction.reply({ content: spec.error, flags: MessageFlags.Ephemeral });
    return;
  }

  const results = Array.from({ length: spec.times }, () => rollOnce(spec));
  const content = formatAll(spec, results, {
    label: get('label', 'getString'),
    dc: get('dc', 'getInteger'),
  });
  await interaction.reply({
    content,
    flags: get('private', 'getBoolean') ? MessageFlags.Ephemeral : undefined,
  });
}

module.exports = {
  rolliecustom: { data: buildData('rolliecustom'), execute },
  rlc: { data: buildData('rlc'), execute },
};
