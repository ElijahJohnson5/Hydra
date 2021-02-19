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
      bot.sendErrorMessage(this.name, 'You need to specify a link or search terms');
      return;
    }

    if (!(await bot.connect(bot.currentMessage.member.voice.channel))) {
      bot.sendErrorMessage(this.name, 'You need to join a voice channel first!');
      return;
    }

    let searchString = "";
    let extraArgs = [];

    for (const arg of args) {
      if (!arg.startsWith('-')) {
        searchString += arg + " ";
      } else {
        extraArgs.push(arg);
      }
    }

    if (searchString.includes('youtube.com')) {
      if (searchString.includes("list=")) {
        const searchParams = new URLSearchParams(searchString.substring(searchString.indexOf('?') + 1));
        const playlistId = searchParams.get('list');
        const results = await youtube.getPlaylistItems(playlistId.trim());

        if (results == null) {
          bot.sendErrorMessage(this.name, 'Error occured while trying to access youtube');
          return;
        } else if (results.items.length == 0) {
          bot.sendErrorMessage(this.name, 'Could not find a playlist with that ID make sure you have entered the correct link');
          return;
        }

        await youtube.getNextPlaylistItems(results);

        for (let i = 0; i < results.items.length && i < 5; i++) {
          const song = results.removeFirst();
          song.onFinished = bot.playNextSongInPlaylist(i, results, youtube);
          await bot.play(song);
        }

      } else {
        const searchParams = new URLSearchParams(searchString.substring(searchString.indexOf('?') + 1));
        const videoId = searchParams.get('v');

        const results = await youtube.findVideoById(videoId.trim());

        if (results == null) {
          bot.sendErrorMessage(this.name, 'Error occured while trying to access youtube');
          return;
        } else if (results.items.length == 0) {
          bot.sendErrorMessage(this.name, 'Could not find a song form that link make sure you have entered the correct link');
          return;
        }
        await bot.play(results.first);
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
      await bot.play(results.first);
    }
  },
};