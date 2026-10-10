const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder().setName('rolliehelp').setDescription('Explain how dice rolling works');

const TEXT = [
  '**🎲 Dice cheat sheet**',
  '**Quick roll:** `/rollie 2x2d20+10` (alias `/rl 2x2d20+10`). Type the notation straight after the command, no option names needed.',
  '`NdS` = roll **N** dice with **S** sides and add them up. `2d20` = two 20-sided dice.',
  '`+M` / `-M` = a **modifier**: a flat number added to (or taken from) the total. `2d20+30` rolls two d20s, then adds 30.',
  '`T x ...` = repeat the whole roll **T** times. `3x1d20+5` gives three separate rolls.',
  '`kh3` / `kl2` = **keep highest/lowest** dice and drop the rest. `4d6kh3` rolls four d6 and keeps the best three. Dropped dice show ~~crossed out~~.',
  '',
  '**Custom roll:** `/rolliecustom` (alias `/rlc`) lets you fill in options instead of, or alongside, the notation. All optional (the same thing can\'t be given twice with different values):',
  '`times`, `count`, `sides`, `modifier`, `keep_highest`, `keep_lowest`',
  '`advantage` rolls two dice and keeps the higher; `disadvantage` keeps the lower.',
  '`dc` reports success if total ≥ DC. `label` names the roll. `private` hides the result from others.',
  '',
  '**Examples**',
  '`/rollie 4d6kh3`',
  '`/rlc dice:1d20+5 advantage:Advantage label:Stealth`',
  '`/rlc times:2 count:2 sides:20 modifier:30` (same as `/rollie 2x2d20+30`)',
  '`/rlc dice:1d20+7 dc:15`',
  '',
  '**Other commands**',
  '`/rolliemodifier score:16` turns an ability score into its modifier (use `base` and `per` for homebrew rules).',
  '`/rolliestats` rolls a full set of ability scores with their modifiers.',
  '',
  'A natural 20 or natural 1 is called out on single d20 rolls.',
].join('\n');

async function execute(interaction) {
  await interaction.reply({ content: TEXT, flags: MessageFlags.Ephemeral });
}

module.exports = { data, execute };
