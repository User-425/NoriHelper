import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keywordsPath = path.join(__dirname, '../data/keywords.json');

class CharacterCommands {
  static addCharacter(user, series, characters) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user === user || u.userid === user);

    if (!userEntry) return `User  not found.`;

    const seriesEntry = userEntry.data.find(s => s.keyword === series);
    if (seriesEntry) {
      seriesEntry.characters = [...new Set([...seriesEntry.characters, ...characters])].sort();
    } else {
      return `Series "${series}" not found.`;
    }

    fs.writeFileSync(keywordsPath, JSON.stringify(keywords, null, 2));
    return `Added characters to series "${series}": ${characters.join(', ')}`;
  }

  static deleteCharacter(user, series, characters) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user === user || u.userid === user);

    if (!userEntry) return `User  not found.`;

    const seriesEntry = userEntry.data.find(s => s.keyword === series);
    if (seriesEntry) {
      seriesEntry.characters = seriesEntry.characters.filter(c => !characters.includes(c));
      fs.writeFileSync(keywordsPath, JSON.stringify(keywords, null, 2));
      return `Deleted characters from series "${series}": ${characters.join(', ')}`;
    } else {
      return `Series "${series}" not found.`;
    }
  }

  static listCharacters(user, series) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user === user || u.userid === user);

    if (!userEntry) return `User not found.`;

    const seriesEntry = userEntry.data.find(s => s.keyword === series);
    return seriesEntry ? seriesEntry.characters.join(', ') || 'No characters found.' : `Series "${series}" not found.`;
  }
}

export { CharacterCommands };