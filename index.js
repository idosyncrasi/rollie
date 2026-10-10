const { Client, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const commands = new Map(require('./commands').map((c) => [c.data.name, c]));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => console.log(`Logged in as ${c.user.tag}`));

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    const msg = { content: 'Something went wrong.', flags: MessageFlags.Ephemeral };
    if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
    else await interaction.reply(msg);
  }
});

client.login(process.env.DISCORD_TOKEN);
