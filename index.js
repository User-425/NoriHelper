import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './data/config.json' assert { type: 'json' };
import { SeriesCommands } from './commands/series.js';
import { CharacterCommands } from './commands/characters.js';
import { Utils } from './commands/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
  console.log(`\x1b[32m[Bot Status]\x1b[0m Logged in as ${client.user.tag}`);
  client.user.setPresence({
    status: 'online',
    activities: [
      {
        name: 'over Master ❤️',
        type: ActivityType.Watching,
      },
    ],
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.id === config.targetBotId) {
    const lines = message.content.split('•').map(line => line.trim());
    const characterIndices = [3, 7, 11];
    const seriesIndices = [4, 8, 12];

    for (let i = 0; i < characterIndices.length; i++) {
      if (characterIndices[i] < lines.length && seriesIndices[i] < lines.length) {
        const character = lines[characterIndices[i]];
        const series = lines[seriesIndices[i]].replace(/`\d+\]`/g, '').trim();
        const keywords = JSON.parse(fs.readFileSync(path.join(__dirname, './data/keywords.json')));
        const userEntries = keywords.filter(u => u.data.some(s => s.keyword.toLowerCase() === series.toLowerCase()));

        if (userEntries.length > 0) {
          for (const userEntry of userEntries) {
            const seriesEntry = userEntry.data.find(s => s.keyword.toLowerCase() === series.toLowerCase());
            const timestamp = new Date().toLocaleString();
            const serverName = message.guild.name;
            const isCharacterBeingLookedFor = (seriesEntry.characters.includes(character.replace(/\*\*/g, '')) || seriesEntry.characters.length === 0) ? '\x1b[0m|\x1b[1m\x1b[33m True\x1b[0m' : '| False';
            console.log(
              '\x1b[1m\x1b[34m[Bot Message]\x1b[0m',
              '\x1b[0m', timestamp,
              '\x1b[1m|\x1b[32m', userEntry.user,
              '\x1b[0m|\x1b[1m\x1b[35m', character.replace(/\*\*/g, ''),
              '\x1b[0m|\x1b[1m\x1b[36m Series:\x1b[0m', series,
              '| ', serverName, isCharacterBeingLookedFor
            );
            const member = await message.guild.members.fetch(userEntry.userid).catch(() => null);

            if (member && (seriesEntry.characters.includes(character.replace(/\*\*/g, '')) || seriesEntry.characters.length === 0)) {
              const response = userEntry.userid === config.ownerId
                ? `<@${userEntry.userid}> Master! I found ${character} from \`${series}\`!`
                : `<@${userEntry.userid}>, there is ${character} from \`${series}\`!`;
              message.reply(response);
            }
          }
        }
      }
    }
    return;
  }

  const prefix = config.prefixes.find(p => message.content.toLowerCase().startsWith(p.toLowerCase()));
  if (!prefix) {
    return;
  }

  const args = message.content.slice(prefix.length).trim().match(/(?:[^\s"]+|"[^"]*")+/g).map(arg => arg.replace(/(^"|"$)/g, ''));
  const command = args.shift().toLowerCase();

  const userId = message.author.id;
  const user = args[0] === 'me' ? userId : args[0];

  const keywords = JSON.parse(fs.readFileSync(path.join(__dirname, './data/keywords.json')));
  const userEntry = keywords.find(u => u.user === user || u.userid === user);

  switch (command) {
    case 'addseries':
    case 'delseries':
    case 'addcharacter':
    case 'delcharacter':
      if (userId !== config.ownerId && (!userEntry || userEntry.userid !== userId)) {
        message.reply("You don't have permission to use this command.");
        return;
      }
      break;
  }

  switch (command) {
    case 'addseries':
      const [series, ...characters] = args.slice(1);
      const response = SeriesCommands.addSeries(user, series, characters);
      message.reply(response);
      break;

    case 'delseries':
      const [delSeries] = args.slice(1);
      const delResponse = SeriesCommands.deleteSeries(user, delSeries);
      message.reply(delResponse);
      break;

    case 'listseries':
      const listResponse = SeriesCommands.listSeries(user);
      message.reply(listResponse);
      break;

    case 'addcharacter':
      const [charSeries, ...charNames] = args.slice(1);
      const addCharResponse = CharacterCommands.addCharacter(user, charSeries, charNames);
      message.reply(addCharResponse);
      break;

    case 'delcharacter':
      const [delCharSeries, ...delCharNames] = args.slice(1);
      const delCharResponse = CharacterCommands.deleteCharacter(user, delCharSeries, delCharNames);
      message.reply(delCharResponse);
      break;

    case 'listcharacter':
      const listCharResponse = CharacterCommands.listCharacters(user, args[1]);
      message.reply(listCharResponse);
      break;

    case 'listall':
      const listAllResponse = SeriesCommands.listSeries(user);
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

    case 'getfilter':
      const getFilterResponse = SeriesCommands.getFilter(user);
      message.reply(getFilterResponse);
      break;

    case 'getfiltercharacter':
      const getFilterCharacterResponse = SeriesCommands.getFilterCharacter(user);
      message.reply(getFilterCharacterResponse);
      break;

    default:
      message.reply("Unknown command. Type `help` to see the list of commands.");
      break;
  }
});

client.login(config.token);

console.log('\x1b[36m[Bot Startup]\x1b[0m Discord Keyword Bot is starting...');