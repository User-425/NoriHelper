import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keywordsPath = path.join(__dirname, '../data/keywords.json');

class CharacterCommands {
  static addCharacter(user, series, characters) {
    if (!characters || characters.length === 0) {
      return `❌ **Error:** No characters specified to add.`;
    }

    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user.toLowerCase() === user.toLowerCase() || u.userid.toLowerCase() === user.toLowerCase());

    if (!userEntry) return `❌ **Error:** User \`${user}\` not found in database.`;

    const seriesEntry = userEntry.data.find(s => s.keyword === series);
    if (!seriesEntry) {
      return `❌ **Error:** Series \`${series}\` not found in your tracking list.`;
    }

    // Identify which characters are new
    const existingCharacters = seriesEntry.characters;
    const newCharacters = characters.filter(char => !existingCharacters.includes(char));
    
    if (newCharacters.length === 0) {
      return `ℹ️ All specified characters are already being tracked in \`${series}\`.`;
    }

    // Add the new characters and sort
    seriesEntry.characters = [...new Set([...seriesEntry.characters, ...newCharacters])].sort();
    fs.writeFileSync(keywordsPath, JSON.stringify(keywords, null, 2));
    
    return `✅ **Characters Added!**\n\nAdded ${newCharacters.length} character${newCharacters.length !== 1 ? 's' : ''} to \`${series}\`:\n• ${newCharacters.join('\n• ')}`;
  }

  static deleteCharacter(user, series, characters) {
    if (!characters || characters.length === 0) {
      return `❌ **Error:** No characters specified to remove.`;
    }

    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user.toLowerCase() === user.toLowerCase() || u.userid.toLowerCase() === user.toLowerCase());

    if (!userEntry) return `❌ **Error:** User \`${user}\` not found in database.`;

    const seriesEntry = userEntry.data.find(s => s.keyword === series);
    if (!seriesEntry) {
      return `❌ **Error:** Series \`${series}\` not found in your tracking list.`;
    }

    // Check which characters actually exist
    const existingCharacters = seriesEntry.characters;
    const foundCharacters = characters.filter(char => existingCharacters.includes(char));
    
    if (foundCharacters.length === 0) {
      return `⚠️ None of the specified characters were found in \`${series}\`.`;
    }

    // Remove the characters
    seriesEntry.characters = seriesEntry.characters.filter(c => !foundCharacters.includes(c));
    fs.writeFileSync(keywordsPath, JSON.stringify(keywords, null, 2));
    
    return `🗑️ **Characters Removed!**\n\nRemoved ${foundCharacters.length} character${foundCharacters.length !== 1 ? 's' : ''} from \`${series}\`:\n• ${foundCharacters.join('\n• ')}`;
  }

  static listCharacters(user, series) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user.toLowerCase() === user.toLowerCase() || u.userid.toLowerCase() === user.toLowerCase());

    if (!userEntry) return `❌ **Error:** User \`${user}\` not found in database.`;

    const seriesEntry = userEntry.data.find(s => s.keyword === series);
    if (!seriesEntry) {
      return `❌ **Error:** Series \`${series}\` not found in your tracking list.`;
    }
    
    if (seriesEntry.characters.length === 0) {
      return `# 👤 Characters in \`${series}\`\n\n**Tracking:** All characters`;
    }
    
    return `# 👤 Characters in \`${series}\`\n\n**Tracking ${seriesEntry.characters.length} characters:**\n\n• ${seriesEntry.characters.join('\n• ')}`;
  }
}

export { CharacterCommands };