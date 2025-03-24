import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

export class Pagination {
  constructor(options = {}) {
    this.pages = options.pages || [];
    this.timeout = options.timeout || 120000; // Extended timeout: 2 minutes
    this.currentPage = 0;
    this.message = null;
    this.authorId = options.authorId;
    this.collector = null;
    this.title = options.title || "Results";
    this.color = options.color || "#0099ff";
  }

  // Create embed for the current page with enhanced styling
  createEmbed() {
    const embed = new EmbedBuilder()
      .setColor(this.color)
      .setDescription(this.pages[this.currentPage])
      .setFooter({
        text: `Page ${this.currentPage + 1} of ${this.pages.length} • Navigation expires in 2 minutes`,
        iconURL: "https://i.imgur.com/AfFp7pu.png", // Optional bot icon
      })
      .setTimestamp();
      
    return embed;
  }

  // Create navigation buttons with improved labels
  createButtons() {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("first")
        .setLabel("First")
        .setEmoji("⏮️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(this.currentPage === 0),
      new ButtonBuilder()
        .setCustomId("previous")
        .setLabel("Previous")
        .setEmoji("◀️") 
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.currentPage === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next")
        .setEmoji("▶️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.currentPage === this.pages.length - 1),
      new ButtonBuilder()
        .setCustomId("last")
        .setLabel("Last")
        .setEmoji("⏭️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(this.currentPage === this.pages.length - 1)
    );
    return row;
  }

  // Start pagination with enhanced messaging
  async start(message) {
    if (this.pages.length === 0)
      return message.reply({ 
        content: "❌ No content to display.",
        ephemeral: true 
      });
      
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
      // Update message to show navigation has expired
      if (this.message) {
        const expiredEmbed = EmbedBuilder.from(this.message.embeds[0])
          .setFooter({ 
            text: `Page ${this.currentPage + 1} of ${this.pages.length} • Navigation expired`,
            iconURL: "https://i.imgur.com/AfFp7pu.png"
          })
          .setColor("#6e6e6e"); // Grayed out color
          
        this.message.edit({ 
          embeds: [expiredEmbed], 
          components: []
        }).catch(() => {});
      }
    });

    return this.message;
  }

  // Split content into pages with improved formatting
  static splitContent(content, maxLength = 750) {
    // If content is already an array, use it directly
    const contentArray = Array.isArray(content) ? content : [content];
    const pages = [];

    for (const block of contentArray) {
      if (block.length <= maxLength) {
        pages.push(block);
        continue;
      }

      // Split by newlines for better readability
      const lines = block.split("\n");
      let currentPage = "";

      for (const line of lines) {
        // If this is a heading, try to keep it with content
        const isHeading = line.startsWith('#') || line.startsWith('##');
        
        if (currentPage.length + line.length + 1 > maxLength && !isHeading) {
          pages.push(currentPage);
          currentPage = line;
        } else {
          currentPage += (currentPage ? "\n" : "") + line;
        }
      }

      if (currentPage) pages.push(currentPage);
    }

    return pages;
  }
}