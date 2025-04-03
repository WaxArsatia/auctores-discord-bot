# Auctores Discord Bot

A Discord economy bot featuring gambling and stealing mechanics.

## Features

- 💰 Currency System
- 🎲 50/50 Gambling (Single & Party)
- 🦹 Steal from other users
- 🛡️ Protection system after being stolen from
- 📊 Leaderboard system
- 🆓 Free coins for broke users
- 🏪 Item shop with protective gear

## Commands

- `/help` - Show detailed information about bot commands and features
- `/balance [user]` - Check your or another user's balance, cooldowns, and protection status
- `/fiftyfifty <amount>` - Gamble with 50/50 chance to double your bet
- `/partyfiftyfifty <amount>` - Start a party 50/50 game where multiple users can join
- `/steal <user>` - Attempt to steal all coins from another user (4h cooldown)
- `/free` - Get free coins when your balance is 0
- `/top` - View the top 10 richest users
- `/shop` - Buy items from the shop
- `/ping` - Check if bot is responsive
- `/givecoin <user> <amount>` - [ADMIN] Give coins to a user

## Game Mechanics

- **Stealing**: 50% chance to steal all coins from target. 4-hour cooldown on failed attempts.
- **Protection**: Users are protected from theft for 1 hour after being stolen from.
- **Party Games**: Multiple users can join a 50/50 gambling session with the same bet amount.
- **Counter-steal Prevention**: Cannot steal from someone who recently stole from you.
- **Free Coins**: Get 100 coins when your balance reaches 0.
- **Bet Limits**: Maximum bet of 250,000 coins for all gambling games.

## Shop Items

- **🛡️ Safe**: Protects 50% of coins when stolen. Costs 10% of current balance.
- **💂 Bodyguard**: Complete protection from theft. Costs 30% of current balance.
- **🔐 Lockpick**: +15% steal success chance. Costs 50% of current balance.

### Item Details

- Safe and Bodyguard last for 3 hours and are one-time use when triggered
- Lockpick lasts for 15 minutes and is consumed on successful steal
- Lockpick has a 4-hour cooldown between purchases
- Item costs scale with your current balance
- Protection items expire after 3 hours if not triggered

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
- JSON File Storage

## Development

The bot uses JSON file storage (`/data/database.json`) for persistent data storage. All user balances, cooldowns, and game states are preserved between bot restarts. The database file is automatically created on first run and is excluded from git tracking.

### Database Structure

```json
{
  "balances": [
    {
      "userId": "string",
      "username": "string",
      "balance": number,
      "lastStolenBy": "string?",
      "cooldownSteal": number?,
      "protectedUntil": number?
    }
  ]
}
```
