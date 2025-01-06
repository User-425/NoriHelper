import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { checkForKeywords, handleKeyword, getAllKeywords, addKeyword, removeKeyword } from './keywordHandler.js';
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
  console.log(message.content);
  if (message.content.startsWith(config.prefix) && message.content.toLowerCase() === `${config.prefix} show all list`) {
    const keywordList = getAllKeywords();
    const messageChunks = splitMessage(`Here are all the keywords:\n${keywordList}`);

    messageChunks.forEach(chunk => {
      message.channel.send(chunk);
    });
  }
});

client.on('messageCreate', (message) => {
  console.log(message.content);
  if (message.content.startsWith(config.prefix) && message.content.toLowerCase() === `${config.prefix} hello`) {
    message.channel.send("Hello!");
  }
});

client.on('messageCreate', (message) => {
  if (message.content.startsWith(config.prefix) && message.content.toLowerCase().startsWith(`${config.prefix} remove keyword`)) {
    const args = message.content.split(' ').slice(3);
    const category = args[0];
    const keyword = args.slice(1).join(' ');

    if (!category || !keyword) {
      message.channel.send('Please provide a valid category and keyword.');
      return;
    }

    try {
      removeKeyword(category, keyword);
      message.channel.send(`Keyword "${keyword}" removed from category "${category}".`);
    } catch (error) {
      message.channel.send(error.message);
    }
  }
});

client.on('messageCreate', (message) => {
  if (message.content.startsWith(config.prefix) && message.content.toLowerCase() === `${config.prefix}stats`) {
    const stats = getStats();
    message.channel.send(`Bot Statistics:\n${stats}`);
  }
});

client.on('messageCreate', (message) => {
  if (message.content.startsWith(config.prefix) && message.content.toLowerCase().startsWith(`${config.prefix} add keyword`)) {
    const args = message.content.split(' ').slice(3);
    const category = args[0];
    const keyword = args.slice(1).join(' ');

    if (!category || !keyword) {
      message.channel.send('Please provide a valid category and keyword.');
      return;
    }

    addKeyword(category, keyword);
    message.channel.send(`Keyword "${keyword}" added to category "${category}".`);
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

function splitMessage(message, maxLength = 2000) {
  const messageChunks = [];
  let currentChunk = '';

  message.split('\n').forEach(line => {
    if (currentChunk.length + line.length + 1 > maxLength) {
      messageChunks.push(currentChunk);
      currentChunk = '';
    }
    currentChunk += line + '\n';
  });

  if (currentChunk) {
    messageChunks.push(currentChunk);
  }

  return messageChunks;
}

client.login(config.token);

console.log('\x1b[36m[Bot Startup]\x1b[0m Discord Keyword Bot is starting...');