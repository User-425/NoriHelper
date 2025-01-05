import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keywords = JSON.parse(fs.readFileSync(path.join(__dirname, 'keywords.json'), 'utf8'));

export function checkForKeywords(message) {
  const lowercaseContent = message.content.toLowerCase();
  
  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (lowercaseContent.includes(word.toLowerCase())) {
        return { category, word };
      }
    }
  }
  
  return null;
}

export function handleKeyword(message, { category, word }) {
  console.log(`\x1b[33m[Keyword Detected]\x1b[0m Category: ${category}, Word: ${word}`);
  
  switch (category) {
    case 'lupis':
    message.reply('<@1120000868335497226> Infoo koleksii :)');
      break;
    case 'valk':
    message.reply('<@331997722305626122> Infoo koleksii :)');
      break;
    case 'cosmic':
    message.reply('<@855862887753842719> Infoo koleksii :)');
      break;
  }
}