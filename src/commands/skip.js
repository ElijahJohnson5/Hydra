export default {
  name: 'skip',
  description: 'Skip a song!',
  execute(bot, _args) {
    bot.deleteCurrentMessage(1000);
    bot.skip();
  },
};