const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client();

// const prefix = '-';

const fs = require('fs');

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach((handler) => {
    require(`./handlers/${handler}`)(client, Discord);
});

// const commandFiles = fs
//     .readdirSync('./commands/')
//     .filter((file) => file.endsWith('.js'));
// for (const file of commandFiles) {
//     const command = require(`./commands/${file}`);
//     client.commands.set(command.name, command);
// }

// client.on('ready', () => {
//     console.log('DongDong is online!');
// });

// client.on('message', (message) => {
//     message.member.roles.cache.has;
//     if (!message.content.startsWith(prefix) || message.author.bot) return;

//     const args = message.content.slice(prefix.length).split(/ +/);
//     const command = args.shift();

//     if (command === 'ping') {
//         client.commands.get('ping').excute(message, args);
//     } else if (command === 'p') {
//         client.commands.get('p').excute(message, args);
//     } else if (command === 'l') {
//         client.commands.get('l').excute(message, args);
//     }
// });

client.login(process.env.DISCORD_TOKEN);
