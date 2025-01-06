export function getStats(client) {
  return `
    • Uptime: ${Math.floor(client.uptime / 60000)} minutes
    • Servers: ${client.guilds.cache.size}
    • Channels: ${client.channels.cache.size}
    • Users: ${client.users.cache.size}
  `;
}

export function splitMessage(message, maxLength = 2000) {
  const messageChunks = [];
  let currentChunk = '';

  message.split('\n').forEach(line => {
    if (currentChunk.length + line.length + 1 > maxLength) {
      messageChunks.push(currentChunk);
      currentChunk = '';
    }
    currentChunk += line + '\n';
  });

  if (currentChunk) {
    messageChunks.push(currentChunk);
  }

  return messageChunks;
}