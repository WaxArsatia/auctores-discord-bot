import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ComponentType,
  userMention,
  MessageFlags,
} from 'discord.js';
import { getUserBalance, updateUserBalance } from '../../data/databaseStore.js';
import {
  createPartySession,
  getPartySession,
  addParticipant,
  endPartySession,
  deletePartySession,
} from '../../data/sessionStore.js';

const WAITING_DURATION = 15000; // 15 seconds
const MIN_PARTICIPANTS = 2;
const MAX_BET = 250000;

const data = new SlashCommandBuilder()
  .setName('partyfiftyfifty')
  .setDescription('Start a party 50/50 game!')
  .addIntegerOption((option) =>
    option
      .setName('amount')
      .setDescription('Amount each player must bet')
      .setRequired(true)
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  const betAmount = interaction.options.getInteger('amount', true);
  const host = interaction.user;
  const hostBalance = getUserBalance(host.id, host.username);

  if (betAmount <= 0) {
    await interaction.reply({
      content: 'Bet amount must be positive!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (betAmount > MAX_BET) {
    await interaction.reply({
      content: `You cannot bet more than ${MAX_BET} coins!`,
    });
    return;
  }

  if (hostBalance.balance < betAmount) {
    await interaction.reply({
      content: `You don't have enough balance! You need ${betAmount} coins.`,
    });
    return;
  }

  // Create embed for the party game
  const embed = new EmbedBuilder()
    .setTitle('🎉 Party 50/50 Game')
    .setDescription(
      `${userMention(host.id)} started a party game!\n` +
        `**Bet Amount:** ${betAmount} coins\n` +
        `**Minimum Players:** ${MIN_PARTICIPANTS}\n` +
        `Click Join to participate! Game starts in ${
          WAITING_DURATION / 1000
        } seconds.`
    )
    .setColor('#FF9300');

  const joinButton = new ButtonBuilder()
    .setCustomId('join_party')
    .setLabel('Join Game')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(joinButton);

  await interaction.reply({
    embeds: [embed],
    components: [row],
  });

  // Fetch the reply to get its message object with ID
  const reply = await interaction.fetchReply();

  // Create game session
  createPartySession(reply.id, betAmount);

  // Add host as first participant
  addParticipant(reply.id, host);
  updateUserBalance(host.id, hostBalance.balance - betAmount);

  // Create button collector
  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: WAITING_DURATION,
  });

  collector.on('collect', async (i) => {
    const user = i.user;
    const userBalance = getUserBalance(user.id, user.username);

    if (user.id === host.id) {
      await i.reply({
        content: "You're already in the game!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const currentSession = getPartySession(reply.id);
    if (!currentSession || !currentSession.isActive) {
      await i.reply({
        content: 'This game session has ended.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (currentSession.participants.has(user.id)) {
      await i.reply({
        content: "You're already in the game!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (userBalance.balance < betAmount) {
      await i.reply({
        content: `You don't have enough balance! You need ${betAmount} coins.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Add participant and deduct balance
    addParticipant(reply.id, user);
    updateUserBalance(user.id, userBalance.balance - betAmount);

    await i.reply({
      content: `You joined the game! ${betAmount} coins have been deducted.`,
      flags: MessageFlags.Ephemeral,
    });

    // Update embed with current participants
    const updatedEmbed = EmbedBuilder.from(reply.embeds[0]!).addFields({
      name: 'Participants',
      value: Array.from(currentSession.participants.values())
        .map((p) => userMention(p.id))
        .join(', '),
    });
    await reply.edit({ embeds: [updatedEmbed] });
  });

  collector.on('end', async () => {
    const session = getPartySession(reply.id);
    if (!session) return;

    endPartySession(reply.id);

    if (session.participants.size < MIN_PARTICIPANTS) {
      // Refund all participants
      session.participants.forEach((user) => {
        const userBalance = getUserBalance(user.id, user.username);
        updateUserBalance(user.id, userBalance.balance + betAmount);
      });

      await reply.edit({
        content: '❌ Game cancelled - not enough players joined!',
        components: [],
      });
      deletePartySession(reply.id);
      return;
    }

    // Calculate total prize pool
    const prizePool = betAmount * session.participants.size;

    // Determine winners (50/50 chance for each participant)
    const winners = Array.from(session.participants.values()).filter(
      () => Math.random() < 0.5
    );

    if (winners.length === 0) {
      await reply.edit({
        content: '😢 No winners! All bets are lost forever!',
        components: [],
      });
    } else {
      // Calculate prize per winner
      const prizePerWinner = Math.floor(prizePool / winners.length);

      // Distribute prizes
      winners.forEach((winner) => {
        const winnerBalance = getUserBalance(winner.id, winner.username);
        updateUserBalance(winner.id, winnerBalance.balance + prizePerWinner);
      });

      const winnersList = winners.map((w) => userMention(w.id)).join(', ');
      await reply.edit({
        content: `🎉 Winners: ${winnersList}\nEach winner receives ${prizePerWinner} coins!`,
        components: [],
      });
    }

    deletePartySession(reply.id);
  });
};

const partyFiftyFiftyHandler = {
  data,
  execute,
};

export default partyFiftyFiftyHandler;
