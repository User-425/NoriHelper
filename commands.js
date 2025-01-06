import { addKeyword, removeKeyword, getAllKeywords, getCategoryKeywords, checkForKeywords, handleKeyword } from './keywordHandler.js';
import { splitMessage, getStats } from './utils.js';

export function handleShowAllList(message, config) {
  if (message.content.toLowerCase() === `${config.prefix} show all list`) {
    const keywordList = getAllKeywords();
    const messageChunks = splitMessage(`📜 **Here are all the keywords:**\n\`\`\`\n${keywordList}\n\`\`\``);

    messageChunks.forEach(chunk => {
      message.reply(chunk);
    });
  }
}

export function handleShowCategoryList(message, config) {
  if (message.content.toLowerCase().startsWith(`${config.prefix} show list`)) {
    const args = message.content.split(' ').slice(3);
    const category = args[0];

    if (!category) {
      message.reply('❌ Please provide a valid category.');
      return;
    }

    try {
      const keywordList = getCategoryKeywords(category);
      const messageChunks = splitMessage(`📜 **Here are the keywords for category _${category}_:**\n\`\`\`\n${keywordList}\n\`\`\``);

      messageChunks.forEach(chunk => {
        message.reply(chunk);
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