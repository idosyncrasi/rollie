const { REST, Routes } = require('discord.js');
const commands = require('./commands');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
const rest = new REST().setToken(DISCORD_TOKEN);
const body = commands.map((c) => c.data.toJSON());
const names = commands.map((c) => '/' + c.data.name).join(', ');

// GUILD_ID may hold several comma-separated server IDs. Without it, commands are registered globally.
const guildIds = (GUILD_ID || '').split(',').map((id) => id.trim()).filter(Boolean);

async function deploy() {
  if (guildIds.length === 0) {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body });
    console.log(`Registered globally: ${names}`);
    return;
  }
  for (const guildId of guildIds) {
    try {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildId), { body });
      console.log(`Registered in guild ${guildId}: ${names}`);
    } catch (err) {
      console.error(`Failed for guild ${guildId}:`, err.message);
    }
  }
}

deploy().catch(console.error);
