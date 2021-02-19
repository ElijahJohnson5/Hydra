import { MessageCollector, MessageEmbed } from 'discord.js';
import ytdl from 'ytdl-core';

class Bot {
  constructor() {
    this.connection = null;
    this.dispatcher = null;
    this.currentMessage = null;
    this.currentMessageDeleted = false;
    this.lastNowPlayingMessage = null;
    this.lastQueuedMessages = [];
    this.playing = false;
    this.currentSong = null;
    this.looping = false;
    this.errorMessage = null;

    this.queue = [];
  }

  async playNextSong() {
    if (this.looping) {
      if (this.dispatcher == null) {
        this.createDispatcher(this.currentSong);
      } else {
        this.dispatcher.destroy();
        this.dispatcher = null;
        this.createDispatcher(this.currentSong);
      }
      return;
    }


    if (this.queue.length === 0) {
      this.dispatcher.destroy();
      this.dispatcher = null;
      if (this.lastNowPlayingMessage != null) {
        this.lastNowPlayingMessage.delete();
        this.lastNowPlayingMessage = null;
      }
      return;
    }

    let song = this.queue.shift();

    if (this.lastNowPlayingMessage != null) {
      await this.lastNowPlayingMessage.delete();
      this.lastNowPlayingMessage = null;
    }

    if (this.lastQueuedMessages.length != 0) {
      await this.lastQueuedMessages.shift().delete();
      this.lastQueuedMessages.forEach(async (message, idx) => {
        let embed = new MessageEmbed();
        embed.setTitle(`Track Queued - Position ${idx + 1}`);
        embed.setDescription(`[${this.queue[idx].title}](${this.queue[idx].url})`);
        return await message.edit(embed);
      });
    }

    let embed = new MessageEmbed();
    embed.setTitle('Now Playing');
    embed.setDescription(`[${song.title}](${song.url})`);

    this.lastNowPlayingMessage = await this.currentMessage.channel.send(embed);
    if (this.dispatcher == null) {
      this.createDispatcher(song);
    } else {
      this.dispatcher.destroy();
      this.dispatcher = null;
      this.createDispatcher(song);
    }
  }

  async play(song, onFinished = null) {
    if (this.connection == null) {
      return;
    }

    if (this.dispatcher == null && this.queue.length === 0) {
      let embed = new MessageEmbed();
      embed.setTitle('Now Playing');
      embed.setDescription(`[${song.title}](${song.url})`);
  
      this.lastNowPlayingMessage = await this.currentMessage.channel.send(embed);
      if (!this.currentMessageDeleted) {
        this.currentMessage.delete({ timeout: 1000 });
        this.currentMessageDeleted = true;
      }
      this.createDispatcher(song, onFinished);
    } else {
      if (this.dispatcher == null) {
        this.playNextSong();
      }

      this.queue.push(song);

      let embed = new MessageEmbed();
      embed.setTitle(`Track Queued - Position ${this.queue.length}`);
      embed.setDescription(`[${song.title}](${song.url})`);
      
      this.lastQueuedMessages.push(await this.currentMessage.channel.send(embed));

      if (!this.currentMessageDeleted) {
        this.currentMessage.delete({ timeout: 1000 });
        this.currentMessageDeleted = true;
      }
    }
  }

  skip() {
    if (this.dispatcher != null) {
      this.dispatcher.pause();
      this.playNextSong();
    }
  }

  pause(paused) {
    if (this.dispatcher != null) {
      if (paused) {
        this.dispatcher.pause();

        let embed = new MessageEmbed();
        embed.setTitle('Paused');
        embed.setDescription(`[${this.currentSong.title}](${this.currentSong.url})`);
        this.lastNowPlayingMessage.edit(embed);
      } else {
        this.dispatcher.resume();

        let embed = new MessageEmbed();
        embed.setTitle('Now Playing');
        embed.setDescription(`[${this.currentSong.title}](${this.currentSong.url})`);
        this.lastNowPlayingMessage.edit(embed);
      }
    }
  }

  sendSearchResults(results) {
    let embed = new MessageEmbed();
    let embedString = '';

    let i = 0;
    do {
      const currentItem = results.items[i];
      const newLine = `${i+1}) [${currentItem.title}](${currentItem.url})\n`;

      if (newLine.length + embedString.length > 2048) {
        break;
      }

      embedString += newLine;
      i++;
    } while (embedString.length < 2048)

    embed.setTitle(`Search Results\nReply with the chosen song number or 'cancel'`);
    embed.setDescription(embedString);
    this.currentMessage.channel.send(embed).then(message => {
      let invalidSelectionMessage = null;
      const collector = new MessageCollector(message.channel, m => m.author.id === this.currentMessage.author.id, { time: 10000 });
      collector.on('collect', selectionMessage => {
        const content = selectionMessage.content.toLowerCase();
        if (invalidSelectionMessage != null) {
          invalidSelectionMessage.delete();
        }
        if (content == 'cancel' || content == 'c') {
          selectionMessage.delete();
          collector.stop();
          return;
        }

        let selection = parseInt(content, 10) || 0;
        selection--;
        if (selection < 0 || selection >= i + 1) {
          selectionMessage.delete({ timeout: 5000 });
          let embed = new MessageEmbed();
          embed.addField(`Invalid Selection`, `Select a number between 1 and 10`);
          selectionMessage.channel.send(embed).then(message => {
            invalidSelectionMessage = message;
          });
        } else {
          selectionMessage.delete();
          this.play(results.items[selection]);
          collector.stop();
        }
      });

      collector.on('end', () => {
        message.delete();
        this.deleteCurrentMessage();
        collector.stop();
      });
    });
  }

  createDispatcher(song, onFinished = null) {
    if (song.url.includes('www.youtube.com')) {
      this.dispatcher = this.connection.play(ytdl(song.url, { filter: 'audioonly'}), { volume: 0.2 });
    } else if (song.url.includes('sounds')) {
      this.dispatcher = this.connection.play(song.url, { volume: 0.2 });
    }

    this.currentSong = song;
    this.dispatcher.on('start', () => this.onDispatcherStart());
    this.dispatcher.on('finish', () => this.onDispathcerFinish(onFinished));
    this.dispatcher.on('error', error => this.onDispatcherError(error))
  }

  onDispatcherStart() {
    console.log("Started Playing");
  }

  onDispathcerFinish(onFinished = null) {
    console.log("Dispatcher finished");
    this.playNextSong();

    if (onFinished != null) {
      onFinished();
    }
  }

  onDispatcherError(error) {
    console.log(error);
  }

  async connect(channel) {
    if (channel) {
      this.connection = await channel.join();
      return true;
    } else {
      return false;
    }
  }

  leave() {
    if (this.connection != null) {
      if (this.dispatcher != null) {
        this.dispatcher.destroy();
        this.dispatcher = null;
      }

      this.connection.disconnect();
      this.connection = null;

      this.clearQueue();
      this.deleteAllMessages();
      this.currentSong = null;
    }
  }

  stop() {
    if (this.dispatcher != null) {
      this.dispatcher.destroy();
      this.dispatcher = null;
      if (this.lastNowPlayingMessage != null) {
        this.lastNowPlayingMessage.delete();
        this.lastNowPlayingMessage = null;
      }

      this.currentSong = null;
      this.looping = false;
    }
  }

  loop(looping) {
    this.looping = looping;
  }

  clearQueue() {
    this.queue = [];
  }

  deleteAllMessages() {
    this.lastQueuedMessages.map((message, idx) => {
      message.delete();
    });

    this.lastQueuedMessages = [];

    if (this.lastNowPlayingMessage != null) {
      this.lastNowPlayingMessage.delete();
      this.lastNowPlayingMessage = null;
    }

    if (this.errorMessage != null) {
      this.errorMessage.delete();
      this.errorMessage = null;
    }
  }

  deleteCurrentMessage(timeout = 0) {
    if (!this.currentMessageDeleted) {
      this.currentMessage.delete({ timeout });
      this.currentMessageDeleted = true;
    }
  }

  setVolume(volume) {
    if (this.dispatcher != null) {
      this.dispatcher.setVolume(volume);
    }
  }

  sendErrorMessage(command, content) {
    if (this.currentMessage != null) {
      let embed = new MessageEmbed();
      embed.setTitle(`Error with ${command}`);
      embed.setDescription(content);
      this.currentMessage.reply(embed).then(message => {
        this.errorMessage = message;
      });
    }
  }
};

export { Bot }