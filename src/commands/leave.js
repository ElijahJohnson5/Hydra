export default {
  name: 'leave',
  description: 'Leaves the voice channel!',
  execute(bot, _args) {
    bot.deleteCurrentMessage(1000);
    bot.leave();
  },
};