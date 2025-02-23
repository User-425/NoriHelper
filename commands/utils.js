import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keywordsPath = path.join(__dirname, '../data/keywords.json');

class Utils {
    static listCommands() {
        return `
**Commands:**
- \`addseries <user> <series> <characters>\` - Add series and characters to the list
- \`delseries <user> <series>\` - Delete series from the list
- \`listseries <user>\` - List all series and characters
- \`addcharacter <user> <series> <characters>\` - Add characters to the series
- \`delcharacter <user> <series> <characters>\` - Delete characters from the series
- \`exccharacter <user> <series> <characters>\` - Exclude characters from the series
- \`listcharacter <user> <series>\` - List all characters from the series
- \`listall <user>\` - List all series and characters
- \`status\` - Show the status of the bot
- \`help\` - Show this help message
`;
    }

    static status() {
        const keywords = JSON.parse(fs.readFileSync(keywordsPath));
        const userCount = keywords.length;
        const seriesCount = keywords.reduce((count, user) => count + user.data.length, 0);
        const currentTime = new Date().toLocaleString();

        return `
Bot is online and ready to serve!
Current time: ${currentTime}
Number of users: ${userCount}
Number of series: ${seriesCount}`;
    }
}

export { Utils };