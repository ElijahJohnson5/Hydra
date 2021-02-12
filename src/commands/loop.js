export default {
  name: 'loop',
  description: 'Loops the current song!',
  execute(bot, _args) {
    bot.deleteCurrentMessage(1000);
    bot.loop(!bot.looping);
  },
};