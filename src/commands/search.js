import Youtube from '../../YouTube.js';

import config from '../../config.json';

const youtube = new Youtube(config.api);

export default {
  name: 'search',
  description: 'Searches for a song!',
  async execute(bot, args) {
    if (args.length === 0) {
      bot.sendErrorMessage(this.name, `You need to specify search terms`);
      return;
    }

    if (!(await bot.connect(bot.currentMessage.member.voice.channel))) {
      bot.sendErrorMessage(this.name, `You need to join a voice channel first!`);
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
    const results = await youtube.searchVideos(searchString);
    
    bot.sendSearchResults(results);
  },
};