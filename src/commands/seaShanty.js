import play from './play.js';

import Path from 'path';

const __dirname = Path.resolve();


export default {
  name: 'seaShanty',
  aliases: ['ss'],
  description: 'For sailing the high seas',
  roles: ['Vice President', 'Majority Whip Dominic Vigil (R-AZ)', 'Senator Brandon Jimenez (R-AZ)', 'Minority Whip Matthew Dalton (D-NV)'],
  async execute(bot, _args) {
    bot.clearQueue();
    bot.deleteAllMessages();
    bot.skip();

    if (!(await bot.connect(bot.currentMessage.member.voice.channel))) {
      bot.deleteCurrentMessage(5000);
      bot.currentMessage.reply('Join a voice channel to hear a special message next time')
        .then(message => message.delete({ timeout: 5000 }));
    }
    bot.play({ title: 'Are you afraid to get wet?', url: Path.join(__dirname, './sounds/afraid-to-get-wet.mp3')});
    bot.setVolume(15);

    play.execute(bot, ['https://www.youtube.com/playlist?list=PLoXMfWxz_h1WnXzF6CnwHO_K1NuqnUbHZ']);
  },
};