export default {
  name: 'resume',
  description: 'Resumes the music!',
  execute(bot, _args) {
    bot.deleteCurrentMessage(1000);
    bot.pause(false);
  },
};