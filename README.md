# Auctores Discord Bot

Discord slash-command economy bot built with Bun and discord.js.

## Overview

This bot provides an in-server coin economy with gambling, stealing, a simple shop, and leaderboard features.

## Features

- Slash commands are registered to a single guild at startup.
- Persistent user balances in `data/database.json` (auto-created on first run).
- Individual and party 50/50 games with a max bet of 250000.
- Steal system with:
  - 50% base success chance
  - +15% success chance with active lockpick
  - 4-hour cooldown after failed steal
  - 1-hour protection for victims after successful steal
  - counter-steal prevention against the last successful thief
- Shop items with balance-based pricing:
  - `safe`: costs 10% of current balance, protects 50% on steal
  - `bodyguard`: costs 30%, blocks theft attempt
  - `lockpick`: costs 50%, active for 15 minutes, 4-hour purchase cooldown
- Free coins command when balance is exactly 0.
- Admin-only coin grant command (`/givecoin`) restricted to one hardcoded user ID.

## Commands

- `/help`
- `/ping`
- `/balance [user]`
- `/fiftyfifty <amount>` (`0` means bet all)
- `/partyfiftyfifty <amount>`
- `/steal <target>`
- `/free`
- `/top`
- `/shop <item>` where `<item>` is `safe`, `bodyguard`, or `lockpick`
- `/givecoin <user> <amount>` (admin only)

## Tech Stack

- Bun
- TypeScript
- discord.js
- dotenv
- ESLint

## Setup and Run

1. Install dependencies:

```bash
bun install
```

2. Create `.env` from `.env.example` and set:

- `DISCORD_TOKEN`
- `DISCORD_APPLICATION_ID`
- `DISCORD_GUILD_ID`

3. Start the bot:

```bash
bun start
```

## Project Structure

```text
src/
  commands/
    admin/
    utility/
    commandRegister.ts
  data/
    databaseStore.ts
    sessionStore.ts
  index.ts
```

## Notes

- User economy data is persisted in `data/database.json`.
- Party game sessions are in memory (`sessionStore`) and are not persisted across restarts.
