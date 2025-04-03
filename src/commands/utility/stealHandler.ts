import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  userMention,
} from 'discord.js';
import {
  getUserBalance,
  updateUserBalance,
  setLastStolenBy,
  setStealCooldown,
  isProtected,
  setProtection,
  getActiveItems,
  triggerItem,
} from '../../data/databaseStore.js';

// 4 hours in milliseconds
const STEAL_COOLDOWN = 4 * 60 * 60 * 1000;
const PROTECTION_DURATION = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

const data = new SlashCommandBuilder()
  .setName('steal')
  .setDescription('Attempt to steal coins from another user with 50% chance')
  .addUserOption((option) =>
    option
      .setName('target')
      .setDescription('The user to steal from')
      .setRequired(true)
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  const thief = interaction.user;
  const target = interaction.options.getUser('target', true);

  // Check if trying to steal from self
  if (thief.id === target.id) {
    await interaction.reply({
      content: '🤦 You cannot steal from yourself!',
      ephemeral: true,
    });
    return;
  }

  const thiefBalance = getUserBalance(thief.id, thief.username);
  const targetBalance = getUserBalance(target.id, target.username);

  // Check if target has any balance to steal
  if (targetBalance.balance <= 0) {
    await interaction.reply({
      content: `${userMention(target.id)} doesn't have any coins to steal!`,
    });
    return;
  }

  // Check if thief is on cooldown
  if (thiefBalance.cooldownSteal && Date.now() < thiefBalance.cooldownSteal) {
    const timeRemaining = Math.ceil(
      (thiefBalance.cooldownSteal - Date.now()) / 1000 / 60
    );
    await interaction.reply({
      content: `⏳ You must wait ${timeRemaining} minutes before attempting to steal again.`,
    });
    return;
  }

  // Check if thief was recently stolen from by the target (protection against counter-steal)
  if (thiefBalance.lastStolenBy === target.id) {
    await interaction.reply({
      content: `🛡️ You cannot steal from ${userMention(
        target.id
      )} as they recently stole from you successfully.`,
    });
    return;
  }

  // Check if target is protected
  if (isProtected(target.id)) {
    await interaction.reply({
      content: `🛡️ ${userMention(
        target.id
      )} is currently protected from theft!`,
    });
    return;
  }

  const thiefItems = getActiveItems(thief.id);
  const targetItems = getActiveItems(target.id);

  let successChance = 0.5;
  if (thiefItems?.lockpick) {
    successChance += 0.15;
  }

  // Perform the steal attempt
  const isSuccessful = Math.random() < successChance;

  if (isSuccessful) {
    let stolenAmount = targetBalance.balance;

    // Check if target has active protection items
    if (targetItems?.bodyguard) {
      triggerItem(target.id, 'bodyguard');
      await interaction.reply({
        content: `🛡️ ${userMention(
          target.id
        )}'s bodyguard blocked your theft attempt!`,
      });
      return;
    }

    if (targetItems?.safe) {
      triggerItem(target.id, 'safe');
      stolenAmount = Math.floor(stolenAmount * 0.5);
    }

    // Update balances
    const newThiefBalance = thiefBalance.balance + stolenAmount;
    const newTargetBalance = targetBalance.balance - stolenAmount;

    updateUserBalance(thief.id, newThiefBalance);
    updateUserBalance(target.id, newTargetBalance);

    // Set protection for the target
    setProtection(target.id, Date.now() + PROTECTION_DURATION);

    // Update target's lastStolenBy property to prevent counter-stealing
    setLastStolenBy(target.id, thief.id);

    await interaction.reply({
      content: `🔫 **Successful heist!** You stole ${stolenAmount} coins from ${userMention(
        target.id
      )}!\n🛡️ ${userMention(
        target.id
      )} is now protected from theft for 1 hour.`,
    });
  } else {
    // Failed steal - apply cooldown
    const cooldownEnd = Date.now() + STEAL_COOLDOWN;
    setStealCooldown(thief.id, cooldownEnd);

    await interaction.reply({
      content: `🚨 **You got caught!** Your attempt to steal from ${userMention(
        target.id
      )} failed. You cannot steal again for 4 hours.`,
    });
  }
};

const stealHandler = {
  data,
  execute,
};

export default stealHandler;
