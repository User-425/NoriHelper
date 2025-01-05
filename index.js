import { Client, GatewayIntentBits } from 'discord.js';
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

client.once('ready', () => {
  console.log(`\x1b[32m[Bot Status]\x1b[0m Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.author.id === config.targetBotId) {
    const keywordInfo = checkForKeywords(message);
    if (keywordInfo) {
      handleKeyword(message, keywordInfo);
    }
  }
});

client.on('messageCreate', (message) => {
  if (message.content.startsWith(config.prefix) && message.content.toLowerCase() === `${config.prefix}stats`) {
    const stats = getStats();
    message.channel.send(`Bot Statistics:\n${stats}`);
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