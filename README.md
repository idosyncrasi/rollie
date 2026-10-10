# Rollie

Rollie is a lightweight Discord bot for rolling dice and generating tabletop-style results for D&D and other RPG systems.

It exposes slash commands for quick rolls, custom dice notation, ability score generation, and stat modifiers.

## Features

- Quick dice rolls with notation such as `2d20+10`, `4d6kh3`, and `2x2d20+30`
- Custom roll builder with options for times, count, sides, modifier, advantage/disadvantage, DC checks, labels, and private results
- Ability score rolling (`/rolliestats`)
- Ability modifier conversion (`/rolliemodifier`)
- Natural 20 / natural 1 highlighting for single d20 rolls
- Keep-highest / keep-lowest dice support

## Commands

- `/rollie <dice>` — quick roll from dice notation
- `/rl <dice>` — alias for `/rollie`
- `/rolliecustom` — build a roll from options
- `/rlc` — alias for `/rolliecustom`
- `/rolliestats` — roll ability scores and show modifiers
- `/rolliemodifier <score>` — convert an ability score into its modifier
- `/rolliehelp` — explain the dice notation and options

## Quick start

1. Install Node.js 20.6 or newer, then install the project dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your bot credentials:

   ```bash
   copy .env.example .env
   ```

   Edit `.env`:

   ```env
   DISCORD_TOKEN=your-bot-token
   CLIENT_ID=your-application-id
   GUILD_ID=
   ```

   `GUILD_ID` is optional. If left blank, the slash commands are registered globally. If you want faster local testing, add one or more comma-separated guild IDs.

3. Deploy the slash commands:

   ```bash
   npm run deploy
   ```

4. Start the bot:

   ```bash
   npm start
   ```

## Project scripts

- `npm run deploy` — register slash commands with Discord
- `npm start` — launch the bot

## Example rolls

```text
/rollie 2d20+5
/rollie 4d6kh3
/rollie 3x1d20+7
/rlc dice:1d20+5 advantage:Advantage label:Stealth
/rolliestats method:4d6kh3 scores:6
/rolliemodifier score:16
```

## Notes

This bot is intended for tabletop and D&D style dice selection. The notation engine supports a simple RPG-friendly syntax and is designed around Discord slash commands.

## License

This project does not currently include a license file. If you plan to publish or share the project publicly, add a license before distributing it.
