import Discord from 'discord.js';
import { getCategoryKeywords, checkForKeywords, handleKeyword, keywords } from './keywordHandler.js';
import { splitMessage, getStats } from './utils.js';
import fs from 'fs';
import path from 'path';

const ITEMS_PER_PAGE = 15;

function paginate(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function createPaginationButtons(currentPage, totalPages) {
  const row = new Discord.ActionRowBuilder()
    .addComponents(
      new Discord.ButtonBuilder()
        .setCustomId('prev')
        .setLabel('Previous')
        .setStyle(Discord.ButtonStyle.Primary)
        .setDisabled(currentPage === 1),
      new Discord.ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(Discord.ButtonStyle.Primary)
        .setDisabled(currentPage === totalPages)
    );
  return row;
}

function getPrefix(message, prefixes) {
  return prefixes.find(prefix => message.content.toLowerCase().startsWith(prefix));
}

export async function handleShowCategoryList(message, config) {
  const prefix = getPrefix(message, config.prefixes);
  if (prefix && message.content.toLowerCase().startsWith(`${prefix} show list`)) {
    const args = message.content.split(' ').slice(3);
    const category = args[0];

    if (!category || category === "me") {
      message.reply('❌ Please provide a valid category.');
      return;
    }

    try {
      const keywordList = getCategoryKeywords(category).split('\n');
      const totalPages = Math.ceil(keywordList.length / ITEMS_PER_PAGE);
      let currentPage = 1;

      const paginatedKeywords = paginate(keywordList, ITEMS_PER_PAGE, currentPage).join('\n');
      const row = createPaginationButtons(currentPage, totalPages);

      const sentMessage = await message.reply({
        content: `📜 **Here are the keywords for category _${category}_ (Page ${currentPage}/${totalPages}):**\n\`\`\`\n${paginatedKeywords}\n\`\`\``,
        components: [row]
      });

      const filter = i => i.user.id === message.author.id;
      const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        if (i.customId === 'prev') {
          currentPage--;
        } else if (i.customId === 'next') {
          currentPage++;
        }

        const paginatedKeywords = paginate(keywordList, ITEMS_PER_PAGE, currentPage).join('\n');
        const row = createPaginationButtons(currentPage, totalPages);

        await i.update({
          content: `📜 **Here are the keywords for category _${category}_ (Page ${currentPage}/${totalPages}):**\n\`\`\`\n${paginatedKeywords}\n\`\`\``,
          components: [row]
        });
      });
    } catch (error) {
      message.reply(`❌ ${error.message}`);
    }
  }
}

export function handleStats(message, config) {
  const prefix = getPrefix(message, config.prefixes);
  if (prefix && message.content.toLowerCase() === `${prefix}stats`) {
    const stats = getStats();
    message.reply(`📊 **Bot Statistics:**\n${stats}`);
  }
}

export function handleAddSeries(message, config) {
  const prefix = getPrefix(message, config.prefixes);
  if (prefix && message.content.toLowerCase().startsWith(`${prefix} add series`)) {
    const args = message.content.split(' ').slice(3);
    const category = args[0];
    const keyword = args.slice(1).join(' ');

    if (!category || !keyword) {
      message.reply('❌ Please provide a valid category and series name.');
      return;
    }

    addKeyword(category, { keyword, characters: [] });
    message.reply(`✅ Series "${keyword}" added to category "${category}".`);
  }
}

export function handleRemoveSeries(message, config) {
  const prefix = getPrefix(message, config.prefixes);
  if (prefix && message.content.toLowerCase().startsWith(`${prefix} remove series`)) {
    const args = message.content.split(' ').slice(3);
    const category = args[0];
    const keyword = args.slice(1).join(' ');

    if (!category || !keyword) {
      message.reply('❌ Please provide a valid category and series name.');
      return;
    }

    try {
      removeKeyword(category, { keyword });
      message.reply(`✅ Series "${keyword}" removed from category "${category}".`);
    } catch (error) {
      message.reply(`❌ ${error.message}`);
    }
  }
}

export function handleAddCharacter(message, config) {
  const prefix = getPrefix(message, config.prefixes);
  if (prefix && message.content.toLowerCase().startsWith(`${prefix} add character`)) {
    const args = message.content.split(' ').slice(3);
    const category = args[0];
    const keyword = args[1];
    const character = args.slice(2).join(' ');

    if (!category || !keyword || !character) {
      message.reply('❌ Please provide a valid category, series name, and character name.');
      return;
    }

    const series = keywords[category].find(wordObj => wordObj.keyword === keyword);
    if (!series) {
      message.reply(`❌ Series "${keyword}" not found in category "${category}".`);
      return;
    }

    series.characters.push(character);
    fs.writeFileSync(path.join(__dirname, 'keywords.json'), JSON.stringify(keywords, null, 2), 'utf8');
    message.reply(`✅ Character "${character}" added to series "${keyword}" in category "${category}".`);
  }
}

export function handleRemoveCharacter(message, config) {
  const prefix = getPrefix(message, config.prefixes);
  if (prefix && message.content.toLowerCase().startsWith(`${prefix} remove character`)) {
    const args = message.content.split(' ').slice(3);
    const category = args[0];
    const keyword = args[1];
    const character = args.slice(2).join(' ');

    if (!category || !keyword || !character) {
      message.reply('❌ Please provide a valid category, series name, and character name.');
      return;
    }

    const series = keywords[category].find(wordObj => wordObj.keyword === keyword);
    if (!series) {
      message.reply(`❌ Series "${keyword}" not found in category "${category}".`);
      return;
    }

    const characterIndex = series.characters.indexOf(character);
    if (characterIndex === -1) {
      message.reply(`❌ Character "${character}" not found in series "${keyword}".`);
      return;
    }

    series.characters.splice(characterIndex, 1);
    fs.writeFileSync(path.join(__dirname, 'keywords.json'), JSON.stringify(keywords, null, 2), 'utf8');
    message.reply(`✅ Character "${character}" removed from series "${keyword}" in category "${category}".`);
  }
}

export function handleKeywords(message, config) {
  if (message.author.id === config.targetBotId || message.author.id === config.ownerId) {
    const keywordMatches = checkForKeywords(message);
    if (keywordMatches.length > 0) {
      handleKeyword(message, keywordMatches);
    }
  }
}

export function handleHello(message, config) {
  const prefix = getPrefix(message, config.prefixes);
  if (prefix && message.content.toLowerCase() === `${prefix} hello`) {
    message.reply('👋 Hello!');
  }
}

export function handleShowCommands(message, config) {
  const prefix = getPrefix(message, config.prefixes);
  if (prefix && message.content.toLowerCase() === `${prefix} show commands`) {
    const commandsList = `
      **Available Commands:**
      • ${prefix} show list <category> - Show keywords for a specific category
      • ${prefix} stats - Show bot statistics
      • ${prefix} add series <category> <series> - Add a series to a category
      • ${prefix} remove series <category> <series> - Remove a series from a category
      • ${prefix} add character <category> <series> <character> - Add a character to a series
      • ${prefix} remove character <category> <series> <character> - Remove a character from a series
      • ${prefix} hello - Say hello to the bot
    `;
    message.reply(commandsList);
  }
}