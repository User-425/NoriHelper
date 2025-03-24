import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keywordsPath = path.join(__dirname, '../data/keywords.json');

class SeriesCommands {
  static addSeries(user, series, characters) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));

    const userEntry = keywords.find(u => u.user.toLowerCase() === user.toLowerCase() || u.userid.toLowerCase() === user.toLowerCase());
    if (!userEntry) return `❌ **Error:** User \`${user}\` not found in database.`;

    const seriesEntry = userEntry.data.find(s => s.keyword === series);
    if (seriesEntry) {
      const addedChars = characters.filter(c => !seriesEntry.characters.includes(c));
      seriesEntry.characters = [...new Set([...seriesEntry.characters, ...characters])].sort();
      
      fs.writeFileSync(keywordsPath, JSON.stringify(keywords, null, 2));
      
      if (addedChars.length > 0) {
        return `✅ **Series Updated!**\n\nAdded ${addedChars.length} new character${addedChars.length !== 1 ? 's' : ''} to \`${series}\`:\n• ${addedChars.join('\n• ')}`;
      } else {
        return `ℹ️ Series \`${series}\` already exists with these characters.`;
      }
    } else {
      userEntry.data.push({ keyword: series, characters: characters.sort() });
      userEntry.data.sort((a, b) => a.keyword.localeCompare(b.keyword));
      
      fs.writeFileSync(keywordsPath, JSON.stringify(keywords, null, 2));
      
      return characters.length > 0 
        ? `✅ **Series Added!**\n\nCreated \`${series}\` with ${characters.length} character${characters.length !== 1 ? 's' : ''}:\n• ${characters.join('\n• ')}`
        : `✅ **Series Added!**\n\nCreated \`${series}\` (tracking all characters)`;
    }
  }

  static deleteSeries(user, series) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user.toLowerCase() === user.toLowerCase() || u.userid.toLowerCase() === user.toLowerCase());

    if (!userEntry) return `❌ **Error:** User \`${user}\` not found in database.`;

    const seriesExists = userEntry.data.some(s => s.keyword === series);
    if (!seriesExists) {
      return `❌ **Error:** Series \`${series}\` not found in your tracking list.`;
    }

    userEntry.data = userEntry.data.filter(s => s.keyword !== series);
    fs.writeFileSync(keywordsPath, JSON.stringify(keywords, null, 2));
    
    return `🗑️ **Series Deleted!**\n\nRemoved \`${series}\` from your tracking list.`;
  }

  static listSeries(user) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user.toLowerCase() === user.toLowerCase() || u.userid.toLowerCase() === user.toLowerCase());

    if (!userEntry) return `❌ **Error:** User \`${user}\` not found in database.`;

    if (userEntry.data.length === 0) {
      return `📋 **${userEntry.user}'s Series List**\n\nNo series are currently being tracked.`;
    }

    const seriesList = userEntry.data.map(s => {
      return `**- ${s.keyword}**`;
    }).join('\n');

    return `# 📋 ${userEntry.user}'s Series List\n\nTracking ${userEntry.data.length} series:\n\n${seriesList}`;
  }

  static getFilter(user) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user.toLowerCase() === user.toLowerCase() || u.userid.toLowerCase() === user.toLowerCase());

    if (!userEntry) return `❌ **Error:** User \`${user}\` not found in database.`;

    const seriesWithAllCharacters = userEntry.data
      .filter(s => s.characters.length === 0)
      .map(s => s.keyword);
      
    if (seriesWithAllCharacters.length === 0) {
      return `❓ **No Series Filters**\n\nYou don't have any series tracking all characters.`;
    }

    return `### 🔍 Series Filter (All Characters)\n\nCopy and paste this filter to search for all characters in your tracked series:\n\`\`\`\nsc s:${seriesWithAllCharacters.join(' , ')}\n\`\`\``;
  }

  static getFilterCharacter(user) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user.toLowerCase() === user.toLowerCase() || u.userid.toLowerCase() === user.toLowerCase());

    if (!userEntry) return `❌ **Error:** User \`${user}\` not found in database.`;

    const seriesWithSpecificChars = userEntry.data
      .filter(s => s.characters.length !== 0)
      .map(s => s.keyword);
      
    const allCharacters = userEntry.data
      .flatMap(s => s.characters);
    
    if (seriesWithSpecificChars.length === 0 || allCharacters.length === 0) {
      return `❓ **No Character Filters**\n\nYou don't have any series with specific character tracking.`;
    }

    return `### 🔍 Character-Specific Filter\n\nCopy and paste this filter to search for your tracked characters:\n\`\`\`\nsc s:${seriesWithSpecificChars.join(' , ')} / n:${allCharacters.join(' , ')}\n\`\`\``;
  }
}

export { SeriesCommands };