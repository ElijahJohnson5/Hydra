export default {
  name: 'pause',
  description: 'Pauses the music!',
  execute(bot, _args) {
    bot.deleteCurrentMessage(1000);
    bot.pause(true);
  },
};