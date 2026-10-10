const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { buildSpec, rollOnce, formatAll } = require('./dice');

// A straight roll: one notation string, e.g. /rollie 2x2d20+10. Registered as both /rollie and /rl.
function makeQuickRoll(name) {
  return {
    data: new SlashCommandBuilder()
      .setName(name)
      .setDescription('Quick roll from notation: 2d20+10, 2x2d20+10, 4d6kh3, d6, or 20')
      .addStringOption((o) =>
        o.setName('dice').setDescription('Notation like 2d20+10, 2x2d20+10, 4d6kh3, d6, or 20').setRequired(true),
      ),

    async execute(interaction) {
      const spec = buildSpec({ dice: interaction.options.getString('dice', true) });
      if (spec.error) {
        await interaction.reply({ content: spec.error, flags: MessageFlags.Ephemeral });
        return;
      }
      const results = Array.from({ length: spec.times }, () => rollOnce(spec));
      await interaction.reply(formatAll(spec, results, {}));
    },
  };
}

module.exports = { rollie: makeQuickRoll('rollie'), rl: makeQuickRoll('rl') };
