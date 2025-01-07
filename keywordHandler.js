import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf8")
);

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
      for (const wordObj of words) {
        const word = wordObj.keyword;
        if (lowercaseContent.includes(word.toLowerCase())) {
          matches.push({ category, word, characters: wordObj.characters });
        }
      }
    }
  }

  return matches;
}

export function getCategoryKeywords(category) {
  if (!keywords[category]) {
    throw new Error(`Category "${category}" does not exist.`);
  }

  return keywords[category].map(wordObj => `• ${wordObj.keyword}`).join('\n');
}

export function handleKeyword(message, matches) {
  for (const { category, word, customMessage, characters } of matches) {
    console.log(
      `\x1b[33m[Keyword Detected]\x1b[0m Category: ${category}, Word: ${word}`
    );
    if (message.author.id === config.targetBotId) {
      if (category === "lupis") {
        message.reply(`<@1120000868335497226> Look, there is ${word}!`);
      }
      if (category === "valk") {
        message.reply("<@331997722305626122> Master, You may want to check this out");
      }
      if (category === "cosmic") {
        message.reply(`<@855862887753842719> Look, there is ${word}`);
      }
    }
    if (category === "me" && message.author.id === config.ownerId) {
      message.reply(customMessage);
    }
    if (characters && characters.length > 0) {
      message.reply(`Characters: ${characters.join(', ')}`);
    }
  }
}

export { keywords };