const Discord = require('discord.js');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'] });
const mysql = require('mysql-database');
const database = new mysql();
const tempChannels = require('discord-temp-channels');
const tempManager = new tempChannels(client);
const settings = require('./settings.json');
const modals = require('discord-modals');
modals(client);
client.commands = new Discord.Collection();
client.slash = new Discord.Collection();
client.aliases = new Discord.Collection();
client.temp = tempManager;
require('dotenv').config();

['hanlders', 'events', 'temp-handler'].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});

// connect to mysql server
(async () => {
  let db = await database.connect({
      host: process.env.HOST,
      user: process.env.USER,
      database: process.env.DATABASE
  });
  db.on('connected', () => {
    console.log('[DataBase] DataBase Connected.'.green);
    client.db = db;
    db.create("channels");
  })
})();

// Register temp channel and config them.
tempManager.registerChannel(settings.channel_id, {
  childCategory: settings.catgory_id,
  childAutoDeleteIfEmpty: true,
  childMaxUsers: 6,
  childFormat: (member, count) => `#${count} | ${member.displayName}`
});

client.login(process.env.TOKEN);