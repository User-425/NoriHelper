import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Utils {
  static listCommands() {
    return `
# 📚 NoriHelper Command Guide 📚

## 🔍 Series Commands
• \`addseries <user> <series> [characters...]\` - Add a series with optional characters
• \`delseries <user> <series>\` - Remove a series from tracking
• \`listseries <user>\` - View all tracked series with their characters
• \`listall <user>\` - Display complete series collection

## 👤 Character Commands
• \`addcharacter <user> <series> <characters...>\` - Add specific characters to track
• \`delcharacter <user> <series> <characters...>\` - Remove characters from tracking
• \`listcharacter <user> <series>\` - View all characters in a specific series

## ⚙️ Filter Commands
• \`getfilter <user>\` - Get series filter for copy/paste
• \`getfiltercharacter <user>\` - Get character filter for copy/paste

## 📊 System Commands
• \`status\` - Check bot status and uptime
• \`help\` - Display this command guide

> **Tip:** Replace \`<user>\` with "me" to target yourself.
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
    
    const renewDate = Math.floor(new Date(renewTime).getTime() / 1000);
    return `✅ **Renewal Updated!**\n\nNext renewal scheduled for <t:${renewDate}:F> (<t:${renewDate}:R>)`;
  }

  static getRenewTime() {
    const configPath = path.join(__dirname, "../data/config.json");
    const config = JSON.parse(fs.readFileSync(configPath));
    const renewTime = Math.floor(new Date(config.renew).getTime() / 1000);
    return `🕒 **Renewal Schedule**\n\nNext renewal due <t:${renewTime}:F> (<t:${renewTime}:R>)`;
  }

  static status() {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    return `
## 🟢 NoriHelper Status

**Version:** \`1.3.2\`
**Status:** Online 
**Uptime:** \`${days}d ${hours}h ${minutes}m ${seconds}s\`

Virgo ready to serve!
`;
  }
}

export { Utils };
