require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
const discordToken = process.env.DISCORD_TOKEN;

const digits = 3;
const maxOriginalSongNum = 62; // there are currently this many original songs
const originalSongNums = [];
let currentSongIndex = -1;
const playedOriginalSongs = [];
let voiceConnection;
let dispatcher;

for (let i = 1; i < maxOriginalSongNum; i++) {
  originalSongNums.push(pad(i));
}

function pad(num) {
  return ("000000000" + num).substr(-digits);
}

function getNextSong() {
  currentSongIndex =
    currentSongIndex === maxOriginalSongNum - 1 ? 0 : currentSongIndex + 1;

  const songName = `./songs/osg_E_${originalSongNums[currentSongIndex]}.mp3`;
  return songName;
}

function getPrevSong() {
  currentSongIndex =
    currentSongIndex > 0 ? currentSongIndex - 2 : maxOriginalSongNum - 1;
  const songName = `./songs/osg_E_${originalSongNums[currentSongIndex]}.mp3`;  
  return songName;
}

function play() {
  const song = getNextSong();
  dispatcher = voiceConnection.play(song);
  dispatcher.on('finish', () => {
    const nextSong = getNextSong();
    voiceConnection.play(nextSong);
  });
}

function pause() {
  if(dispatcher)
    dispatcher.pause();
}

function previous() {
  const song = getPrevSong();
  dispatcher = voiceConnection.play(song);
  dispatcher.on('finish', () => {
    const nextSong = getNextSong();
    voiceConnection.play(nextSong);
  })
}

client.on("ready", () => {
  console.log(`client connected as ${client.user.tag}`);
});

client.on("message", async (message) => {
  if (!message.guild) return;

  if (message.content === '!jwjoin') {
    // Only try to join the sender's voice channel if they are in one themselves
    if (message.member.voice.channel) {
      voiceConnection = await message.member.voice.channel.join();      
    } else {
      message.reply('You need to join a voice channel first!');
    }
  }

  switch (message.content) {
    case "!jwplay":
      if(dispatcher && dispatcher.paused)
      {
        dispatcher.resume();
      }else {
        play();
      }      
      break;
    case "!jwpause":
      pause();
      break;
    case "!jwnext":
      play();
      break;
    case "!jwprev":
      previous();
      break;
    case "!jwkick":
      if(voiceConnection)
        voiceConnection.disconnect();
      break;
  }
});

client.login(discordToken);
