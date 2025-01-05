import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const keywords = JSON.parse(
  fs.readFileSync(path.join(__dirname, "keywords.json"), "utf8")
);

export function checkForKeywords(message) {
  const lowercaseContent = message.content.toLowerCase();
  const matches = [];

  for (const [category, words] of Object.entries(keywords)) {
    if (category === "me") {
      for (const [word, customMessage] of Object.entries(words)) {
        if (lowercaseContent.includes(word.toLowerCase())) {
          matches.push({ category, word, customMessage });
        }
      }
    } else {
      for (const word of words) {
        if (lowercaseContent.includes(word.toLowerCase())) {
          matches.push({ category, word });
        }
      }
    }
  }

  return matches;
}

export function handleKeyword(message, matches) {
  for (const { category, word, customMessage } of matches) {
    console.log(
      `\x1b[33m[Keyword Detected]\x1b[0m Category: ${category}, Word: ${word}`
    );
    if (category === "lupis") {
      message.reply("Haloo");
      // message.reply('<@1120000868335497226> Infoo koleksii :)');
    }
    if (category === "valk") {
      message.reply("\:)");
      // message.reply('<@331997722305626122> Tuan, ada kartu yang mungkin menarik bagi tuan :)');
    }
    if (category === "cosmic") {
      message.reply("<@855862887753842719> Infoo koleksii :)");
    }
    if (category === "me" && message.author.id === config.ownerId) {
      message.reply(customMessage);
    } else if (category === "me") {
      message.reply("<@855862887753842719> Infoo koleksii :)");
    }
  }
}
