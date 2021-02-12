import { Client, Collection } from 'discord.js';
import { Bot } from './bot.js';
import config from '../config.json';
import commands from './commands/index.js'

const bot = new Bot();

const client = new Client();
client.commands = new Collection();

for (const command of commands) {
  client.commands.set(command.name, command);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if (!message.guild) return;

  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (command.roles) {
    const member = message.member;
    if (!member || !member.roles.cache.some(role => command.roles.includes(role.name))) {
      return;
    }
  }

  try {
    if (bot.errorMessage != null) {
      bot.deleteCurrentMessage();
      bot.errorMessage.delete();
      bot.errorMessage = null;
    }

    bot.currentMessage = message;
    bot.currentMessageDeleted = false;
    command.execute(bot, args);
  } catch (error) {
    console.error(error);
    message.reply('There was a problem with that command');
  }
});

client.on('disconnect', () => {
  bot.deleteAllMessages();
})

client.login(config.token);