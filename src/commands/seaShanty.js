import play from './play.js';

import Path from 'path';

const __dirname = Path.resolve();


export default {
  name: 'seaShanty',
  aliases: ['ss'],
  description: 'For sailing the high seas',
  roles: ['Vice President', 'me nigga', 'Senator Brandon Jimenez (R-AZ)', 'Minority Whip Matthew Dalton (D-NV)'],
  async execute(bot, _args) {
    bot.clearQueue();
    bot.deleteAllMessages();
    if (bot.currentSong != null) {
      bot.currentSong.onFinished = null;
    }

    bot.skip(0);

    if (!(await bot.connect(bot.currentMessage.member.voice.channel))) {
      bot.sendErrorMessage(this.name, 'You must join a voice channel');
      return;
    }

    const song = { 
      title: 'Are you afraid to get wet?', 
      url: Path.join(__dirname, './sounds/afraid-to-get-wet.mp3'),
      onFinished: () => {
        play.execute(bot, ['https://www.youtube.com/playlist?list=PLoXMfWxz_h1WnXzF6CnwHO_K1NuqnUbHZ']);
      },
    };

    await bot.play(song); 
    bot.setVolume(15);
  },
};