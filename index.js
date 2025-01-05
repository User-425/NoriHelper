import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { checkForKeywords, handleKeyword } from './keywordHandler.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
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

  const rest = new REST({ version: '10' }).setToken(config.token);
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(client.user.id, config.guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

client.on('messageCreate', (message) => {
  if (message.author.id === config.targetBotId || message.author.id === config.ownerId) {
    const keywordMatches = checkForKeywords(message);
    if (keywordMatches.length > 0) {
      handleKeyword(message, keywordMatches);
    }
  }
});

client.on('messageCreate', (message) => {
  if (message.content.startsWith(config.prefix) && message.content.toLowerCase() === `${config.prefix}stats`) {
    const stats = getStats();
    message.channel.send(`Bot Statistics:\n${stats}`);
  }
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

function getStats() {
  return `
    • Uptime: ${Math.floor(client.uptime / 60000)} minutes
    • Servers: ${client.guilds.cache.size}
    • Channels: ${client.channels.cache.size}
    • Users: ${client.users.cache.size}
  `;
}

client.login(config.token);

console.log('\x1b[36m[Bot Startup]\x1b[0m Discord Keyword Bot is starting...');