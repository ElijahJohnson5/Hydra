import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

const decodeEntities = (encodedString) => {
  var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  var translate = {
      "nbsp":" ",
      "amp" : "&",
      "quot": "\"",
      "lt"  : "<",
      "gt"  : ">"
  };
  return encodedString.replace(translate_re, function(match, entity) {
      return translate[entity];
  }).replace(/&#(\d+);/gi, function(match, numStr) {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
  });
}

class VideoList {
  constructor(response, getVideoId) {
    this.items = response.items.map(item => {
      return {
        title: decodeEntities(item.snippet.title),
        url: `https://www.youtube.com/watch?v=${getVideoId(item)}`,
      };
    });


    if (this.items.length > 0) {
      this.first = this.items[0];
    } else {
      this.first = null;
    }
  }
};

class YouTube {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }


  async searchVideos(query) {
    const response =  await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(query)}&type=video&key=${this.apiKey}`);
    const json = await response.json();

    if (!json.items) {
      return null;
    }

    return new VideoList(json, (item => item.id.videoId));
  }

  async findVideoById(id) {
    const response = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${this.apiKey}`);
    const json = await response.json();

    if (!json.items) {
      return null;
    }

    return new VideoList(json, (item => item.id));
  }

  async getPlaylistItems(playlistId) {
    const response = await fetch(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${this.apiKey}`);
    const json = await response.json();

    if (!json.items) {
      return null;
    }

    return new VideoList(json, (item => item.snippet.resourceId.videoId));
  }
};

export default YouTube;