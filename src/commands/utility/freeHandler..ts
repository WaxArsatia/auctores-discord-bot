import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { getUserBalance, updateUserBalance } from '../../data/databaseStore.js';

const data = new SlashCommandBuilder()
  .setName('free')
  .setDescription('Get free coins!');

const DEFAULT_FREE_COINS = 100;

const execute = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.user;
  const userBalance = getUserBalance(user.id, user.username);

  if (userBalance.balance !== 0) {
    await interaction.reply({
      content: 'You only get free coins if your balance is 0!',
    });
    return;
  }

  // Give free coins
  const freeCoins = DEFAULT_FREE_COINS;
  updateUserBalance(user.id, freeCoins);
  await interaction.reply(
    `💰 You received **${freeCoins}** free coins! Your new balance is **${freeCoins}** coins.`
  );
};

const freeHandler = {
  data,
  execute,
};

export default freeHandler;
