import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./data/config.json" assert { type: "json" };
import { SeriesCommands } from "./commands/series.js";
import { CharacterCommands } from "./commands/characters.js";
import { Utils } from "./commands/utils.js";
import { Pagination } from "./pagination.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", async () => {
  console.log(`\x1b[32m[Bot Status]\x1b[0m Logged in as ${client.user.tag}`);
  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: "over Master ❤️",
        type: ActivityType.Watching,
      },
    ],
  });

  const configPath = path.join(__dirname, "./data/config.json");
  const config = JSON.parse(fs.readFileSync(configPath));
  const renewTime = new Date(config.renew);
  const currentTime = new Date();

  if (currentTime >= renewTime) {
    const owner = await client.users.fetch(config.ownerId);
    owner.send("Master, it's time to renew!");
  }
});

function sendReply(message, response, usePagination = false) {
  if (usePagination) {
    const pages = Pagination.splitContent(response);
    const pagination = new Pagination({
      pages: pages,
      authorId: message.author.id,
    });
    return pagination.start(message);
  } else {
    // Existing code for non-paginated responses
    const maxLength = 2000;
    if (response.length <= maxLength) {
      message.reply(response);
    } else {
      const parts = [];
      while (response.length > 0) {
        let part = response.slice(0, maxLength);
        const lastNewLineIndex = part.lastIndexOf("\n");
        if (lastNewLineIndex > -1) {
          part = response.slice(0, lastNewLineIndex + 1);
        }
        parts.push(part);
        response = response.slice(part.length);
      }
      parts.forEach((part) => message.reply(part));
    }
  }
}

client.on("messageCreate", async (message) => {
  if (message.author.id === config.targetBotId) {
    const lines = message.content.split("•").map((line) => line.trim());
    const characterIndices = [3, 7, 11];
    const seriesIndices = [4, 8, 12];

    // Load keywords once to avoid repeated file I/O
    const keywords = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./data/keywords.json"))
    );

    for (let i = 0; i < characterIndices.length; i++) {
      if (
        characterIndices[i] >= lines.length ||
        seriesIndices[i] >= lines.length
      )
        continue;

      const character = lines[characterIndices[i]]
        .replace(/\*\*/g, "")
        .replace(/<:\w+:\d+>/, "")
        .replace(/:\d+:/, "")
        .trim();
      const series = lines[seriesIndices[i]].replace(/`\d+\]`/g, "").trim();

      // Filter user entries for the specific series
      const userEntries = keywords.filter((u) =>
        u.data.some((s) => s.keyword.toLowerCase() === series.toLowerCase())
      );

      if (userEntries.length === 0) continue;

      // Process each matching user entry
      for (const userEntry of userEntries) {
        const seriesEntry = userEntry.data.find(
          (s) => s.keyword.toLowerCase() === series.toLowerCase()
        );
        const timestamp = new Date().toLocaleString();
        const serverName = message.guild.name;

        // Check if the character is in the series entry
        const isCharacterBeingLookedFor =
          seriesEntry.characters.includes(character) ||
          seriesEntry.characters.length === 0;

        console.log(
          "\x1b[1m\x1b[34m[Bot Message]\x1b[0m",
          "\x1b[0m",
          timestamp,
          "\x1b[1m|\x1b[32m",
          userEntry.user,
          "\x1b[0m|\x1b[1m\x1b[35m",
          character,
          "\x1b[0m|\x1b[1m\x1b[36m Series:\x1b[0m",
          series,
          "| ",
          serverName,
          isCharacterBeingLookedFor
            ? "\x1b[0m|\x1b[1m\x1b[33m True\x1b[0m"
            : "| False"
        );

        if (!isCharacterBeingLookedFor) continue;
        if (userEntry.isLooking === false) continue;

        // Fetch the member once
        const member = await message.guild.members
          .fetch(userEntry.userid)
          .catch(() => null);

        if (member) {
          // Compose and send a response
          const response =
            userEntry.userid === config.ownerId
              ? `<@${userEntry.userid}> Master! I found ${character} from \`${series}\`!`
              : `<@${userEntry.userid}>, there is ${character} from \`${series}\`!`;

          message.reply(response);
        } else {
          // Optional DM to the owner if configured
          if (config.dmOwnerOnCharacterFound) {
            const messageLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
            client.users.fetch(config.ownerId).then((owner) => {
              owner.send(
                `I found ${userEntry.user}'s list, **${character}** from \`${series}\`! Here is the [link](${messageLink}).`
              );
            });
          }
        }
      }
    }
  }

  const prefix = config.prefixes.find((p) =>
    message.content.toLowerCase().startsWith(p.toLowerCase())
  );
  if (!prefix) {
    return;
  }

  const args = message.content
    .slice(prefix.length)
    .trim()
    .match(/(?:[^\s"]+|"[^"]*")+/g)
    .map((arg) => arg.replace(/(^"|"$)/g, ""));
  const command = args.shift().toLowerCase();

  const userId = message.author.id;
  const user = args[0] === "me" ? userId : args[0];

  try {
    if (user !== "") {
      user = user.toLowerCase();
    }
  } catch (error) {
    // console.log(error);
  }

  const keywords = JSON.parse(
    fs.readFileSync(path.join(__dirname, "./data/keywords.json"))
  );
  const userEntry = keywords.find(
    (u) => u.user.toLowerCase() === user || u.userid === user
  );

  switch (command) {
    case "addseries":
    case "delseries":
    case "addcharacter":
    case "delcharacter":
      if (
        userId !== config.ownerId &&
        (!userEntry || userEntry.userid !== userId)
      ) {
        message.reply("You don't have permission to use this command.");
        return;
      }
      break;
  }

  switch (command) {
    case "addseries":
      const [series, ...characters] = args.slice(1);
      const response = SeriesCommands.addSeries(user, series, characters);
      sendReply(message, response);
      break;

    case "delseries":
      const [delSeries] = args.slice(1);
      const delResponse = SeriesCommands.deleteSeries(user, delSeries);
      sendReply(message, delResponse);
      break;

    case "listseries":
      const listResponse = SeriesCommands.listSeries(user);
      sendReply(message, listResponse, true);
      break;

    case "addcharacter":
      const [charSeries, ...charNames] = args.slice(1);
      const addCharResponse = CharacterCommands.addCharacter(
        user,
        charSeries,
        charNames
      );
      sendReply(message, addCharResponse);
      break;

    case "delcharacter":
      const [delCharSeries, ...delCharNames] = args.slice(1);
      const delCharResponse = CharacterCommands.deleteCharacter(
        user,
        delCharSeries,
        delCharNames
      );
      sendReply(message, delCharResponse);
      break;

    case "listcharacter":
      const listCharResponse = CharacterCommands.listCharacters(user, args[1]);
      sendReply(message, listCharResponse, true); // Enable pagination
      break;

    case "listall":
      const listAllResponse = SeriesCommands.listSeries(user);
      sendReply(message, listAllResponse, true); // Enable pagination
      break;

    case "status":
      const statusResponse = Utils.status();
      sendReply(message, statusResponse);
      break;

    case "help":
      const helpResponse = Utils.listCommands();
      sendReply(message, helpResponse);
      break;

    case "getfilter":
      const getFilterResponse = SeriesCommands.getFilter(user);
      sendReply(message, getFilterResponse);
      break;

    case "getfiltercharacter":
      const getFilterCharacterResponse =
        SeriesCommands.getFilterCharacter(user);
      sendReply(message, getFilterCharacterResponse);
      break;

    case "setrenew":
      if (userId !== config.ownerId) {
        message.reply("You don't have permission to use this command.");
        return;
      }
      const setRenewResponse = Utils.setrenew();
      sendReply(message, setRenewResponse);
      break;

    case "getrenewtime":
      if (userId !== config.ownerId) {
        message.reply("You don't have permission to use this command.");
        return;
      }
      const getRenewTimeResponse = Utils.getRenewTime();
      sendReply(message, getRenewTimeResponse);
      break;

    default:
      sendReply(
        message,
        "Unknown command. Type `help` to see the list of commands."
      );
      break;
  }
});

client.login(config.token);

console.log("\x1b[36m[Bot Startup]\x1b[0m Discord Keyword Bot is starting...");
