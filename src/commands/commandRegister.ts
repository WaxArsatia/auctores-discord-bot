import {
  REST,
  Routes,
  type ApplicationCommandData,
  type Client,
} from 'discord.js';
import pingHandler from './utility/pingHandler';
import fiftyFiftyHandler from './utility/fiftyFiftyHandler';
import balanceHandler from './utility/balanceHandler';
import freeHandler from './utility/freeHandler.';
import topHandler from './utility/topHandler';
import stealHandler from './utility/stealHandler.js';
import partyFiftyFiftyHandler from './utility/partyFiftyFiftyHandler';
import helpHandler from './utility/helpHandler';
import giveCoinHandler from './admin/giveCoinHandler';

const commandRegister = async (client: Client<boolean>) => {
  if (!process.env.DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is not defined in .env file');
  }
  if (!process.env.DISCORD_APPLICATION_ID) {
    throw new Error('DISCORD_APPLICATION_ID is not defined in .env file');
  }
  if (!process.env.DISCORD_GUILD_ID) {
    throw new Error('DISCORD_GUILD_ID is not defined in .env file');
  }

  client.commands.set(pingHandler.data.name, pingHandler);
  client.commands.set(fiftyFiftyHandler.data.name, fiftyFiftyHandler);
  client.commands.set(balanceHandler.data.name, balanceHandler);
  client.commands.set(freeHandler.data.name, freeHandler);
  client.commands.set(topHandler.data.name, topHandler);
  client.commands.set(stealHandler.data.name, stealHandler);
  client.commands.set(partyFiftyFiftyHandler.data.name, partyFiftyFiftyHandler);
  client.commands.set(helpHandler.data.name, helpHandler);
  client.commands.set(giveCoinHandler.data.name, giveCoinHandler);

  const commands = [];

  commands.push(pingHandler.data.toJSON());
  commands.push(fiftyFiftyHandler.data.toJSON());
  commands.push(balanceHandler.data.toJSON());
  commands.push(freeHandler.data.toJSON());
  commands.push(topHandler.data.toJSON());
  commands.push(stealHandler.data.toJSON());
  commands.push(partyFiftyFiftyHandler.data.toJSON());
  commands.push(helpHandler.data.toJSON());
  commands.push(giveCoinHandler.data.toJSON());

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = (await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_APPLICATION_ID,
        process.env.DISCORD_GUILD_ID
      ),
      {
        body: commands,
      }
    )) as ApplicationCommandData[];

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
};

export default commandRegister;
