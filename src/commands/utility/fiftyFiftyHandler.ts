import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { getUserBalance, updateUserBalance } from '../../data/databaseStore.js';

const MAX_BET = 250000;

const data = new SlashCommandBuilder()
  .setName('fiftyfifty')
  .setDescription(
    'Gacha 50/50! Win to double your balance, lose to lose it all!'
  )
  .addIntegerOption((option) =>
    option
      .setName('amount')
      .setDescription('Amount to bet (0 to bet all)')
      .setRequired(true)
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.user;
  const userBalance = getUserBalance(user.id, user.username);
  const betAmount = interaction.options.getInteger('amount', true);

  // Validate bet amount
  if (betAmount < 0) {
    await interaction.reply({
      content: 'You cannot bet a negative amount!',
      ephemeral: true,
    });
    return;
  }

  // Handle "bet all" case
  const actualBetAmount = betAmount === 0 ? userBalance.balance : betAmount;

  if (actualBetAmount === 0) {
    await interaction.reply({
      content: 'You cannot bet 0 coins! send /free to get free coins.',
      ephemeral: true,
    });
    return;
  }

  if (actualBetAmount > MAX_BET) {
    await interaction.reply({
      content: `You cannot bet more than ${MAX_BET} coins!`,
    });
    return;
  }

  if (actualBetAmount > userBalance.balance) {
    await interaction.reply({
      content: `You don't have enough money! Your balance is ${userBalance.balance} coins.`,
    });
    return;
  }

  // Perform the 50/50 gacha
  const randomNumber = Math.random();
  const isWin = randomNumber < 0.5;

  let newBalance;
  let resultEmoji;
  let resultMessage;

  if (isWin) {
    // Double the bet amount
    newBalance = userBalance.balance + actualBetAmount;
    resultEmoji = '🏆 Win';
    resultMessage = `You won ${actualBetAmount} coins! Your new balance is ${newBalance} coins.`;
  } else {
    // Lose the bet amount
    newBalance = userBalance.balance - actualBetAmount;
    resultEmoji = '😢 Lose';
    resultMessage = `You lost ${actualBetAmount} coins! Your new balance is ${newBalance} coins.`;
  }

  // Update the user's balance
  updateUserBalance(user.id, newBalance);

  // Reply with the result
  await interaction.reply(`${resultEmoji} | ${resultMessage}`);
};

const fiftyFiftyHandler = {
  data,
  execute,
};

export default fiftyFiftyHandler;
