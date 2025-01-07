import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './data/config.json' assert { type: 'json' };
import { SeriesCommands } from './commands/series.js';
import { CharacterCommands } from './commands/characters.js';
import { Utils } from './commands/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
  console.log(`\x1b[32m[Bot Status]\x1b[0m Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.author.id === config.targetBotId) {
    const lines = message.content.split('•').map(line => line.trim());
    if (lines.length === 5) {
        const character = lines[3];
        const series = lines[4];
        const keywords = JSON.parse(fs.readFileSync(path.join(__dirname, './data/keywords.json')));
        const userEntry = keywords.find(u => u.data.some(s => s.keyword.toLowerCase() === series.toLowerCase()));
        if (userEntry) {
            const seriesEntry = userEntry.data.find(s => s.keyword.toLowerCase() === series.toLowerCase());
            console.log('\x1b[36m[Bot Message]\x1b[0m', seriesEntry);
            if (seriesEntry.characters.includes(character.replace(/\*\*/g, '')) || seriesEntry.characters.length === 0) {
                const response = userEntry.userid === config.ownerId
                    ? `<@${userEntry.userid}> Master! I found ${character} from \`${series}!\``
                    : `<@${userEntry.userid}>, there is ${character} from ${series}!`;
                message.reply(response);
            }
        }
    }
    return;
  }

  const prefix = config.prefixes.find(p => message.content.toLowerCase().startsWith(p.toLowerCase()));
  if (!prefix) {
    return;
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const userId = message.author.id;
  switch (command) {
    case 'addseries':
      if (userId !== config.ownerId) {
        message.reply("You don't have permission to use this command.");
        return;
      }
      const [user, series, ...characters] = args;
      const response = SeriesCommands.addSeries(user, series, characters);
      message.reply(response);
      break;

    case 'delseries':
      if (userId !== config.ownerId) {
        message.reply("You don't have permission to use this command.");
        return;
      }
      const [delUser , delSeries] = args;
      const delResponse = SeriesCommands.deleteSeries(delUser , delSeries);
      message.reply(delResponse);
      break;

    case 'listseries':
      const listResponse = SeriesCommands.listSeries(args[0] || 'me');
      message.reply(listResponse);
      break;

    case 'addcharacter':
      if (userId !== config.ownerId) {
        message.reply("You don't have permission to use this command.");
        return;
      }
      const [charUser , charSeries, ...charNames] = args;
      const addCharResponse = CharacterCommands.addCharacter(charUser , charSeries, charNames);
      message.reply(addCharResponse);
      break;

    case 'delcharacter':
      if (userId !== config.ownerId) {
        message.reply("You don't have permission to use this command.");
        return;
      }
      const [delCharUser , delCharSeries, ...delCharNames] = args;
      const delCharResponse = CharacterCommands.deleteCharacter(delCharUser , delCharSeries, delCharNames);
      message.reply(delCharResponse);
      break;

    case 'listcharacter':
      const listCharResponse = CharacterCommands.listCharacters(args[0] || 'me', args[1]);
      message.reply(listCharResponse);
      break;

    case 'listall':
      const listAllResponse = SeriesCommands.listSeries(args[0] || 'me');
      message.reply(listAllResponse);
      break;

    case 'status':
      const statusResponse = Utils.status();
      message.reply(statusResponse);
      break;

    case 'help':
      const helpResponse = Utils.listCommands();
      message.reply(helpResponse);
      break;

    default:
      message.reply("Unknown command. Type `help` to see the list of commands.");
      break;
  }
});

client.login(config.token);

console.log('\x1b[36m[Bot Startup]\x1b[0m Discord Keyword Bot is starting...');