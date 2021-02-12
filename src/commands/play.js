import Youtube from '../../YouTube.js';
import { URLSearchParams } from 'url';

import config from '../../config.json';

const youtube = new Youtube(config.api);

export default {
  name: 'play',
  aliases: ['p'],
  description: 'Play a song!',
  async execute(bot, args) {
    if (args.length === 0) {
      bot.deleteCurrentMessage(5000);
      bot.currentMessage.reply('You need to specify a link or search terms')
        .then(message => message.delete({ timeout: 5000 }));
      return;
    }

    if (!(await bot.connect(bot.currentMessage.member.voice.channel))) {
      bot.deleteCurrentMessage(5000);
      bot.currentMessage.reply('You need to join a voice channel first!')
        .then(message => message.delete({ timeout: 5000 }));
    }

    let searchString = "";
    let extraArgs = [];

    for (const arg of args) {
      if (!arg.startsWith('-')) {
        searchString += arg;
      } else {
        extraArgs.push(arg);
      }
    }

    if (searchString.includes('youtube.com')) {
      if (searchString.includes("list=")) {
        const searchParams = new URLSearchParams(searchString.substring(searchString.indexOf('?') + 1));
        const playlistId = searchParams.get('list');
        const results = await youtube.getPlaylistItems(playlistId);

        if (results == null) {
          bot.sendErrorMessage(this.name, 'Error occured while trying to access youtube');
          return;
        } else if (results.items.length == 0) {
          bot.sendErrorMessage(this.name, 'Could not find a playlist with that ID make sure you have entered the correct link');
          return;
        }

        for (let i = 0; i < results.items.length; i++) {
          bot.play(results.items[i]);
        }
      } else {
        const results = await youtube.searchVideos(searchString);
        if (results == null) {
          bot.sendErrorMessage(this.name, 'Error occured while trying to access youtube');
          return;
        } else if (results.items.length == 0) {
          bot.sendErrorMessage(this.name, 'Could not find a song form that link make sure you have entered the correct link');
          return;
        }
        bot.play(results.first);
      }
    } else {
      const results = await youtube.searchVideos(searchString);
      if (results == null) {
        bot.sendErrorMessage(this.name, 'Error occured while trying to access youtube');
        return;
      } else if (results.items.length == 0) {
        bot.sendErrorMessage(this.name, 'Could not find any results for that search term');
        return;
      }
      bot.play(results.first);
    }
  },
};