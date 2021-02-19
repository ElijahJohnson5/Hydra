export default {
  name: 'skip',
  description: 'Skip a song!',
  execute(bot, args) {
    let skipIndex = 0;

    if (args.length > 0) {
      skipIndex = parseInt(args[0]) || 0;
    }


    bot.deleteCurrentMessage(1000);
    bot.skip(skipIndex);
  },
};