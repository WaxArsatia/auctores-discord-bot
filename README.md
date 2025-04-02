# Auctores Discord Bot

A Discord economy bot featuring gambling and stealing mechanics.

## Features

- 💰 Currency System
- 🎲 50/50 Gambling
- 🦹 Steal from other users
- 📊 Leaderboard system
- 🆓 Free coins for broke users

## Commands

- `/balance [user]` - Check your or another user's balance
- `/fiftyfifty <amount>` - Gamble with 50/50 chance to double your bet
- `/steal <user>` - Attempt to steal all coins from another user
- `/free` - Get free coins when broke
- `/top` - View the top 10 richest users
- `/ping` - Check if bot is responsive

## Setup

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Copy `.env.example` to `.env` and fill in:

   - `DISCORD_TOKEN` - Your bot token
   - `DISCORD_APPLICATION_ID` - Your application ID
   - `DISCORD_GUILD_ID` - Your server ID

4. Start the bot:

```bash
bun start
```

## Technologies

- TypeScript
- Discord.js
- Bun runtime
- ESLint

## Development

The bot uses an in-memory database that resets on restart. Commands are automatically registered on startup.
