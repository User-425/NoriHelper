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

    static status() {
        return `Bot is online and ready to serve!`;
    }
}

export { Utils };