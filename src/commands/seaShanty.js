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
    bot.skip();

    if (!(await bot.connect(bot.currentMessage.member.voice.channel))) {
      bot.sendErrorMessage(this.name, 'You must join a voice channel');
      return;
    }

    await bot.play({ title: 'Are you afraid to get wet?', url: Path.join(__dirname, './sounds/afraid-to-get-wet.mp3')}, () => {
      play.execute(bot, ['https://www.youtube.com/playlist?list=PLoXMfWxz_h1WnXzF6CnwHO_K1NuqnUbHZ']);
    });
    bot.setVolume(15);
  },
};