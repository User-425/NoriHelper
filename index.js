import Discord from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleShowAllList, handleShowCategoryList, handleStats, handleAddKeyword, handleRemoveKeyword, handleKeywords, handleHello, handleAddSeries, handleRemoveSeries, handleAddCharacter, handleRemoveCharacter, handleShowCommands } from './commands.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', async () => {
  console.log(`\x1b[32m[Bot Status]\x1b[0m Logged in as ${client.user.tag}`);

  const commands = [
    {
      name: 'a',
      description: 'a',
      options: [
        {
          name: 'to',
          type: 3,
          description: 'to',
          required: true,
        },
        {
          name: 'msg',
          type: 3,
          description: 'msg',
          required: true,
        },
      ],
    },
  ];

  const rest = new Discord.REST({ version: '10' }).setToken(config.token);
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Discord.Routes.applicationGuildCommands(client.user.id, config.guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

client.on('messageCreate', (message) => {
  handleKeywords(message, config);
  handleShowAllList(message, config);
  handleShowCategoryList(message, config);
  handleStats(message, config);
  handleAddKeyword(message, config);
  handleRemoveKeyword(message, config);
  handleHello(message, config);
  handleAddSeries(message, config);
  handleRemoveSeries(message, config);
  handleAddCharacter(message, config);
  handleRemoveCharacter(message, config);
  handleShowCommands(message, config);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'reply') {
    if (interaction.user.id !== config.ownerId) {
      await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      return;
    }

    const replyToId = options.getString('replyto');
    const replyMessage = options.getString('message');

    try {
      const replyToMessage = await interaction.channel.messages.fetch(replyToId);
      if (replyToMessage) {
        await replyToMessage.reply(replyMessage);
        await interaction.reply({ content: 'Message sent successfully.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Message to reply to not found.', ephemeral: true });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'An error occurred while fetching the message to reply to.', ephemeral: true });
    }
  }
});

client.login(config.token);

console.log('\x1b[36m[Bot Startup]\x1b[0m Discord Keyword Bot is starting...');