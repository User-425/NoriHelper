import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Utils {
  static listCommands() {
    return `
**Commands:**
- \`addseries <user> <series> <characters>\` - Add series and characters to the list
- \`delseries <user> <series>\` - Delete series from the list
- \`listseries <user>\` - List all series and characters
- \`addcharacter <user> <series> <characters>\` - Add characters to the series
- \`delcharacter <user> <series> <characters>\` - Delete characters from the series
- \`listcharacter <user> <series>\` - List all characters from the series
- \`listall <user>\` - List all series and characters
- \`status\` - Show the status of the bot
- \`help\` - Show this help message
`;
  }

  static setrenew() {
    const configPath = path.join(__dirname, "../data/config.json");
    const config = JSON.parse(fs.readFileSync(configPath));
    const renewTime = new Date(
      Date.now() + 4 * 24 * 60 * 60 * 1000
    ).toISOString();
    config.renew = renewTime;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return `Renew time set to <t:${renewTime.toFixed(0)}:R>`;
  }

  static getRenewTime() {
    const configPath = path.join(__dirname, "../data/config.json");
    const config = JSON.parse(fs.readFileSync(configPath));
    const renewTime = new Date(config.renew).getTime() / 1000;
    return `Current renew time is <t:${renewTime.toFixed(0)}:R>`;
  }

  static status() {
    return `Bot is online and ready to serve!`;
  }
}

export { Utils };
