export default {
  name: 'stop',
  description: 'Stops the music!',
  execute(bot, _args) {
    bot.deleteCurrentMessage(1000);
    bot.stop();
  },
};