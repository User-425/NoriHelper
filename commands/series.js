import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keywordsPath = path.join(__dirname, '../data/keywords.json');

class SeriesCommands {
  static addSeries(user, series, characters) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user === user || u.userid === user);

    if (!userEntry) return `User not found.`;

    const seriesEntry = userEntry.data.find(s => s.keyword === series);
    if (seriesEntry) {
      seriesEntry.characters = [...new Set([...seriesEntry.characters, ...characters])].sort();
    } else {
      userEntry.data.push({ keyword: series, characters: characters.sort() });
      userEntry.data.sort((a, b) => a.keyword.localeCompare(b.keyword));
    }

    fs.writeFileSync(keywordsPath, JSON.stringify(keywords, null, 2));
    return characters.length > 0 
    ? `Sucessfully added series "${series}" with characters: ${characters.join(', ')}`
    : `Sucessfuly added series "${series}"`;
  }

  static deleteSeries(user, series) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user === user || u.userid === user);

    if (!userEntry) return `User not found.`;

    userEntry.data = userEntry.data.filter(s => s.keyword !== series);
    fs.writeFileSync(keywordsPath, JSON.stringify(keywords, null, 2));
    return `Deleted series "${series}".`;
  }

  static listSeries(user) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user === user || u.userid === user);

    if (!userEntry) return `User not found.`;

    return userEntry.data.map(s => `${s.keyword}: ${s.characters.join(', ') || 'No characters'}`).join('\n') || 'No series found.';
  }

  static getFilter(user) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user === user || u.userid === user);

    if (!userEntry) return `User not found.`;

    const seriesWithCharacters = userEntry.data
      .filter(s => s.characters.length === 0)
      .map(s => s.keyword)
      .join(' , ');

    return `\`\`\`sc s:${seriesWithCharacters}\`\`\``;
  }

  static getFilterCharacter(user) {
    const keywords = JSON.parse(fs.readFileSync(keywordsPath));
    const userEntry = keywords.find(u => u.user === user || u.userid === user);

    if (!userEntry) return `User not found.`;

    const seriesWithCharacters = userEntry.data
      .filter(s => s.characters.length !== 0)
      .map(s => s.keyword)
      .join(' , ');

    const allCharacters = userEntry.data
      .flatMap(s => s.characters)
      .join(' , ');

    return `sc s:${seriesWithCharacters} / n:${allCharacters}`;
  }
}

export { SeriesCommands };