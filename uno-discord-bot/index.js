require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { MessageFlags } = require("discord.js");
const UNO_BACKEND_BASE = process.env.UNO_BACKEND_BASE;     // e.g. http://localhost:3001
const UNO_FRONTEND_BASE = process.env.UNO_FRONTEND_BASE;   // e.g. http://localhost:8080
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;

async function createUnoRoom(playerId) {
  const res = await fetch(`${UNO_BACKEND_BASE}/api/rooms/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Room create failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  if (!data.roomId) throw new Error("No roomId returned from server");
  return data.roomId;
}

client.once("clientReady", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});


client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "uno") return;

  // extra safety check (even though command perms are set)
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: "❌ Admins only.", flags: MessageFlags.Ephemeral });
  }

  await interaction.deferReply({
  flags: MessageFlags.Ephemeral
});

  // Use discord user id as a stable playerId
  const hostPlayerId = `discord_${interaction.user.id}`;
  let roomId;
  try {
    roomId = await createUnoRoom(hostPlayerId);
  } catch (e) {
    return interaction.editReply(`❌ Failed to create room: ${e.message}`);
  }

const joinUrl = `http://localhost:8080/?room=${roomId}`;


  const channel = await client.channels.fetch(TARGET_CHANNEL_ID).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildText) {
    return interaction.editReply("❌ Target channel not found (check TARGET_CHANNEL_ID).");
  }

  const embed = new EmbedBuilder()
    .setTitle("🎮 UNO lobby created!")
    .setDescription(`Room code: **${roomId}**\nClick the button to join.`)
    .addFields({ name: "Join link", value: joinUrl });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("Join UNO").setStyle(ButtonStyle.Link).setURL(joinUrl)
  );

  await channel.send({ content: "@everyone Let’s play UNO!", embeds: [embed], components: [row] });

  await interaction.editReply(`✅ Posted UNO lobby link. Room: ${roomId}`);
});

client.login(process.env.DISCORD_TOKEN);
