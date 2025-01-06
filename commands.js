import Discord from 'discord.js';
import { addKeyword, removeKeyword, getAllKeywords, getCategoryKeywords, checkForKeywords, handleKeyword } from './keywordHandler.js';
import { splitMessage, getStats } from './utils.js';

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

export async function handleShowAllList(message, config) {
  if (message.content.toLowerCase() === `${config.prefix} show all list`) {
    const keywordList = getAllKeywords().split('\n');
    const totalPages = Math.ceil(keywordList.length / ITEMS_PER_PAGE);
    let currentPage = 1;

    const paginatedKeywords = paginate(keywordList, ITEMS_PER_PAGE, currentPage).join('\n');
    const row = createPaginationButtons(currentPage, totalPages);

    const sentMessage = await message.reply({
      content: `📜 **Here are all the keywords (Page ${currentPage}/${totalPages}):**\n\`\`\`\n${paginatedKeywords}\n\`\`\``,
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
        content: `📜 **Here are all the keywords (Page ${currentPage}/${totalPages}):**\n\`\`\`\n${paginatedKeywords}\n\`\`\``,
        components: [row]
      });
    });
  }
}

export async function handleShowCategoryList(message, config) {
  if (message.content.toLowerCase().startsWith(`${config.prefix} show list`)) {
    const args = message.content.split(' ').slice(3);
    const category = args[0];

    if (!category) {
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
  if (message.content.toLowerCase() === `${config.prefix}stats`) {
    const stats = getStats();
    message.reply(`📊 **Bot Statistics:**\n${stats}`);
  }
}

export function handleAddKeyword(message, config) {
  if (message.content.toLowerCase().startsWith(`${config.prefix} add keyword`)) {
    const args = message.content.split(' ').slice(3);
    const category = args[0];
    const keyword = args.slice(1).join(' ');

    if (!category || !keyword) {
      message.reply('❌ Please provide a valid category and keyword.');
      return;
    }

    addKeyword(category, keyword);
    message.reply(`✅ Keyword "${keyword}" added to category "${category}".`);
  }
}

export function handleRemoveKeyword(message, config) {
  if (message.content.toLowerCase().startsWith(`${config.prefix} remove keyword`)) {
    const args = message.content.split(' ').slice(3);
    const category = args[0];
    const keyword = args.slice(1).join(' ');

    if (!category || !keyword) {
      message.reply('❌ Please provide a valid category and keyword.');
      return;
    }

    try {
      removeKeyword(category, keyword);
      message.reply(`✅ Keyword "${keyword}" removed from category "${category}".`);
    } catch (error) {
      message.reply(`❌ ${error.message}`);
    }
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
  if (message.content.toLowerCase() === `${config.prefix} hello`) {
    message.reply('👋 Hello!');
  }
}