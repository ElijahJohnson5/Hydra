import Path from 'path';

const __dirname = Path.resolve();

export default {
  name: 'eo66',
  description: 'Execute Order 66!',
  roles: ['Vice President', 'me nigga', 'Senator Brandon Jimenez (R-AZ)', 'Minority Whip Matthew Dalton (D-NV)'],
  async execute(bot, _args) {
    bot.clearQueue();
    bot.deleteAllMessages();
    bot.skip();
    if (!(await bot.connect(bot.currentMessage.member.voice.channel))) {
      bot.deleteCurrentMessage(5000);
      bot.currentMessage.reply('Join a voice channel to hear a special message next time')
        .then(message => message.delete({ timeout: 5000 }));
    }
    bot.play({ title: 'Executing Order 66', url: Path.join(__dirname, './sounds/execute-order-66.mp3')});
    bot.setVolume(15);
  },
};