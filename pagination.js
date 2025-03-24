import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

export class Pagination {
  constructor(options = {}) {
    this.pages = options.pages || [];
    this.timeout = options.timeout || 60000; // Default timeout: 1 minute
    this.currentPage = 0;
    this.message = null;
    this.authorId = options.authorId;
    this.collector = null;
  }

  // Create embed for the current page
  createEmbed() {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setDescription(this.pages[this.currentPage])
      .setFooter({
        text: `Page ${this.currentPage + 1} of ${this.pages.length}`,
      });
    return embed;
  }

  // Create navigation buttons
  createButtons() {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("first")
        .setLabel("⏮️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.currentPage === 0),
      new ButtonBuilder()
        .setCustomId("previous")
        .setLabel("◀️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.currentPage === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("▶️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.currentPage === this.pages.length - 1),
      new ButtonBuilder()
        .setCustomId("last")
        .setLabel("⏭️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.currentPage === this.pages.length - 1)
    );
    return row;
  }

  // Start pagination
  async start(message) {
    if (this.pages.length === 0)
      return message.reply("No content to paginate.");
    if (this.pages.length === 1) {
      // If only one page, just send without buttons
      return message.reply({ embeds: [this.createEmbed()] });
    }

    this.message = await message.reply({
      embeds: [this.createEmbed()],
      components: [this.createButtons()],
    });

    // Create button collector
    this.collector = this.message.createMessageComponentCollector({
      filter: (i) => i.user.id === this.authorId,
      time: this.timeout,
    });

    this.collector.on("collect", async (interaction) => {
      // Update current page based on button clicked
      switch (interaction.customId) {
        case "first":
          this.currentPage = 0;
          break;
        case "previous":
          this.currentPage = Math.max(0, this.currentPage - 1);
          break;
        case "next":
          this.currentPage = Math.min(
            this.pages.length - 1,
            this.currentPage + 1
          );
          break;
        case "last":
          this.currentPage = this.pages.length - 1;
          break;
      }

      // Update the message
      await interaction.update({
        embeds: [this.createEmbed()],
        components: [this.createButtons()],
      });
    });

    this.collector.on("end", () => {
      // Remove buttons when collector ends
      if (this.message) {
        this.message.edit({ components: [] }).catch(() => {});
      }
    });

    return this.message;
  }

  // Split content into pages
  static splitContent(content, maxLength = 750) {
    const pages = [];

    if (content.length <= maxLength) {
      pages.push(content);
      return pages;
    }

    // Split by newlines for better readability
    const lines = content.split("\n");
    let currentPage = "";

    for (const line of lines) {
      if (currentPage.length + line.length + 1 > maxLength) {
        pages.push(currentPage);
        currentPage = line;
      } else {
        currentPage += (currentPage ? "\n" : "") + line;
      }
    }

    if (currentPage) pages.push(currentPage);
    return pages;
  }
}
