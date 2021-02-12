export default {
  name: 'ping',
  description: 'Ping!',
  execute(bot, _args) {
    bot.currentMessage.channel.send('Pong.');
  },
};