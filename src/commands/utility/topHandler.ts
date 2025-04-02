import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { getTop10Balances } from '../../data/databaseStore.js';

const data = new SlashCommandBuilder()
  .setName('top')
  .setDescription(
    'Shows the top 10 leaderboard users with the highest balance'
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  const topUsers = getTop10Balances();

  if (!topUsers || topUsers.length === 0) {
    await interaction.reply('No users with balance found.');
    return;
  }

  let leaderboardMessage = '**🏆 Top 10 Balance Leaderboard 🏆**\n\n';

  topUsers.forEach((user, index) => {
    const medal =
      index === 0
        ? '🥇'
        : index === 1
        ? '🥈'
        : index === 2
        ? '🥉'
        : `${index + 1}.`;
    leaderboardMessage += `${medal} <@${
      user.userId
    }>: ${user.balance.toLocaleString()} coins\n`;
  });

  await interaction.reply(leaderboardMessage);
};

const topHandler = {
  data,
  execute,
};

export default topHandler;
