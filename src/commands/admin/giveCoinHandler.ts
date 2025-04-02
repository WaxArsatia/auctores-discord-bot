import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  userMention,
  MessageFlags,
} from 'discord.js';
import { getUserBalance, updateUserBalance } from '../../data/databaseStore.js';

const ADMIN_ID = '321830337833467907';

const data = new SlashCommandBuilder()
  .setName('givecoin')
  .setDescription('[ADMIN] Give coins to a user')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('User to give coins to')
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName('amount')
      .setDescription('Amount of coins to give')
      .setRequired(true)
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  // Check if user is admin
  if (interaction.user.id !== ADMIN_ID) {
    await interaction.reply({
      content: '❌ This command is restricted to administrators only.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const target = interaction.options.getUser('user', true);
  const amount = interaction.options.getInteger('amount', true);

  if (amount <= 0) {
    await interaction.reply({
      content: '❌ Amount must be positive!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const targetBalance = getUserBalance(target.id, target.username);
  const newBalance = targetBalance.balance + amount;
  updateUserBalance(target.id, newBalance);

  await interaction.reply({
    content: `✅ Successfully gave ${amount} coins to ${userMention(
      target.id
    )}.\nNew balance: ${newBalance} coins`,
  });
};

const giveCoinHandler = {
  data,
  execute,
};

export default giveCoinHandler;
