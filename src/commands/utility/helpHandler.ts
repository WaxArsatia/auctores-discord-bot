import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Show detailed information about bot commands and features');

const execute = async (interaction: ChatInputCommandInteraction) => {
  const embed = new EmbedBuilder()
    .setTitle('🤖 Auctores Bot Help')
    .setColor('#FF9300')
    .setDescription('Economy bot with gambling and stealing mechanics')
    .addFields(
      {
        name: '💰 Currency Commands',
        value:
          '`/balance [user]` - Check balance, cooldowns, and protection status\n' +
          '`/free` - Get 100 coins when broke\n' +
          '`/top` - View top 10 richest users',
      },
      {
        name: '🎲 Gambling Commands',
        value:
          '`/fiftyfifty <amount>` - 50/50 chance to double your bet\n' +
          '`/partyfiftyfifty <amount>` - Start a party gambling game',
      },
      {
        name: '🦹 Stealing System',
        value:
          '`/steal <user>` - 50% chance to steal all coins from target\n' +
          '• 4-hour cooldown on failed attempts\n' +
          '• Target gets 1-hour protection after being stolen from\n' +
          '• Cannot counter-steal from someone who just stole from you',
      },
      {
        name: '🎮 Game Mechanics',
        value:
          '• Starting balance: 1000 coins\n' +
          '• Free coins when balance hits 0\n' +
          '• Party games need minimum 2 players\n' +
          '• Protection system prevents theft spam',
      }
    )
    .setFooter({
      text: 'Use these commands in any channel the bot has access to',
    });

  await interaction.reply({ embeds: [embed] });
};

const helpHandler = {
  data,
  execute,
};

export default helpHandler;
