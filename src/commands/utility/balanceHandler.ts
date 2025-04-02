import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  userMention,
} from 'discord.js';
import { getUserBalance, isProtected } from '../../data/databaseStore.js';

const data = new SlashCommandBuilder()
  .setName('balance')
  .setDescription('Shows balance information')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription(
        'User to check balance for (leave empty to check your own)'
      )
      .setRequired(false)
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  // Check if a user was specified, otherwise use the command issuer
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const isSelf = targetUser.id === interaction.user.id;

  const userBalance = getUserBalance(targetUser.id, targetUser.username);

  // Start building the reply based on whose balance we're checking
  let reply = isSelf
    ? `💰 Your balance: **${userBalance.balance}** coins`
    : `💰 ${userMention(targetUser.id)}'s balance: **${
        userBalance.balance
      }** coins`;

  // Only show detailed information if checking own balance
  if (isSelf) {
    // Add last stolen by information if available
    if (userBalance.lastStolenBy) {
      reply += `\n🥷 Last stolen by: <@${userBalance.lastStolenBy}>`;
    }

    // Add cooldown information
    if (userBalance.cooldownSteal) {
      const now = Date.now();
      const cooldownEnd = userBalance.cooldownSteal;

      if (now < cooldownEnd) {
        const timeLeftSeconds = Math.ceil((cooldownEnd - now) / 1000);

        // Format time left in hours and minutes
        const hoursLeft = Math.floor(timeLeftSeconds / 3600);
        const minutesLeft = Math.floor((timeLeftSeconds % 3600) / 60);

        let cooldownMessage = `\n⏱️ Steal cooldown: `;

        if (hoursLeft > 0) {
          cooldownMessage += `**${hoursLeft} hour${
            hoursLeft !== 1 ? 's' : ''
          }**`;
          if (minutesLeft > 0) {
            cooldownMessage += ` **${minutesLeft} minute${
              minutesLeft !== 1 ? 's' : ''
            }**`;
          }
        } else if (minutesLeft > 0) {
          cooldownMessage += `**${minutesLeft} minute${
            minutesLeft !== 1 ? 's' : ''
          }**`;
        } else {
          cooldownMessage += `**less than a minute**`;
        }

        cooldownMessage += ` remaining`;
        reply += cooldownMessage;
      } else {
        reply += '\n✅ You can steal from others now!';
      }
    } else {
      reply += '\n✅ You can steal from others now!';
    }

    // Add protection information
    if (isProtected(targetUser.id)) {
      const user = getUserBalance(targetUser.id, targetUser.username);
      const timeLeftSeconds = Math.ceil(
        (user.protectedUntil! - Date.now()) / 1000
      );
      const minutesLeft = Math.floor(timeLeftSeconds / 60);
      reply += `\n🛡️ Protected from theft for **${minutesLeft} minutes**`;
    }
  }

  await interaction.reply(reply);
};

const balanceHandler = {
  data,
  execute,
};

export default balanceHandler;
