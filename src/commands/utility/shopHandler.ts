import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { buyItem, getUserBalance } from '../../data/databaseStore.js';

const data = new SlashCommandBuilder()
  .setName('shop')
  .setDescription('Buy items from the shop')
  .addStringOption((option) =>
    option
      .setName('item')
      .setDescription('Item to buy')
      .setRequired(true)
      .addChoices(
        { name: '🛡️ Safe - Protect 50% coins from theft', value: 'safe' },
        {
          name: '💂 Bodyguard - Full protection from theft',
          value: 'bodyguard',
        },
        { name: '🔐 Lockpick - +15% steal success chance', value: 'lockpick' }
      )
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  const user = interaction.user;
  const itemType = interaction.options.getString('item', true) as
    | 'safe'
    | 'bodyguard'
    | 'lockpick';
  const userBalance = getUserBalance(user.id, user.username);

  const itemCosts = {
    safe: Math.floor(userBalance.balance * 0.1),
    bodyguard: Math.floor(userBalance.balance * 0.3),
    lockpick: Math.floor(userBalance.balance * 0.5),
  };

  const itemDescriptions = {
    safe: '🛡️ Safe: Protects 50% of your coins when stolen (3 hours, one-time use)',
    bodyguard:
      '💂 Bodyguard: Complete protection from theft (3 hours, one-time use)',
    lockpick:
      '🔐 Lockpick: +15% steal success chance (15 minutes, one-time use, 4h cooldown)',
  };

  const cost = itemCosts[itemType];

  const embed = new EmbedBuilder()
    .setTitle('🏪 Item Shop')
    .setColor('#FF9300')
    .setDescription(
      `Your balance: ${userBalance.balance} coins\n\n` +
        `Selected item: ${itemDescriptions[itemType]}\n` +
        `Cost: ${cost} coins (${
          itemType === 'safe' ? '10%' : itemType === 'bodyguard' ? '30%' : '50%'
        } of your balance)`
    );

  const success = buyItem(user.id, itemType);

  if (success) {
    embed.addFields({
      name: '✅ Purchase Successful',
      value: `You bought a ${itemType}!\nNew balance: ${
        userBalance.balance - cost
      } coins${
        itemType === 'lockpick'
          ? '\n⚠️ Lockpick will expire in 15 minutes!'
          : ''
      }`,
    });
  } else {
    const reason =
      userBalance.balance < cost
        ? 'Insufficient balance!'
        : itemType === 'lockpick' &&
          userBalance.items?.lockpick?.cooldownUntil &&
          Date.now() < userBalance.items.lockpick.cooldownUntil
        ? `Lockpick on cooldown! Available in ${Math.ceil(
            (userBalance.items.lockpick.cooldownUntil - Date.now()) / 1000 / 60
          )} minutes`
        : 'Purchase failed!';

    embed.addFields({
      name: '❌ Purchase Failed',
      value: reason,
    });
  }

  await interaction.reply({ embeds: [embed] });
};

const shopHandler = {
  data,
  execute,
};

export default shopHandler;
