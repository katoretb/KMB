/*---------------------------------------------------------------------------*/
const Discord = require("discord.js");
const {prefix, token, yttoken, botname, playcom, skipcom, stopcom} = require("./config.json");
const ytdl = require("ytdl-core-discord");
const YouTube = require("discord-youtube-api");
const youtube = new YouTube(yttoken);
const client = new Discord.Client();

const queue = new Map();
/*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*/
client.once("ready", () => {
    console.log("---------------------------------------");
    console.log("|        <--Maker credit-->           |");
    console.log("|          KatoreTV#5571              |");
    console.log("---------------------------------------");
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setStatus('Online');
    client.user.setActivity( prefix + 'help เพื่อดูคำสั่ง');
    const vol = 5;
  });
  
client.once("reconnecting", () => {
  console.log("Reconnecting!");
});
  
client.once("disconnect", () => {
  console.log("Disconnect!");
});
/*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*/
client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const serverQueue = queue.get(message.guild.id);
    if (message.content.startsWith(`${prefix}`)){
      const commans = message.content.split(" ");
      commans[0] = commans[0].substring(1);
      if(playcom.includes(commans[0])){
        execute(message, serverQueue);
        return;
      }else if(skipcom.includes(commans[0])){
        skip(message, serverQueue);
        return;
      }else if(stopcom.includes(commans[0])){
        stop(message, serverQueue);
        return;
      }
    }
}
);
/*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*/
async function execute(message, serverQueue) {   
    const args = message.content.split(" ");
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "เข้าไปห้องคุยแบบเสียงก่อนสิเดียวเปิดเพลงให้"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "เราไม่มีสิทธิเข้าห้องรนั้นอะ"
      );
    }
    args.shift();
    const songInfo = await youtube.searchVideos(args.join("_"));
    const song = {
      title: songInfo.title,
      url: songInfo.url,
      length: songInfo.length,
      thumbnail: songInfo.thumbnail
    }
    const song2 = songInfo.title
  
    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        songlist: [],
        sl: false,
        cl: 0,
        vol: 100,
        playing: true
      };
      queue.set(message.guild.id, queueContruct);
      queueContruct.songs.push(song);
      queueContruct.songlist.push(song2);
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      const addsong = new Discord.MessageEmbed()
        .setColor('#04ff00')
        .setTitle(botname)
        .setDescription('ทำการเพิ่มเพลง')
        .setThumbnail(songInfo.thumbnail)
        .addFields(
          { name: 'ชื่อเพลง', value: songInfo.title },
          { name: 'ความยาวเพลง', value: songInfo.length, inline: true},
          { name: 'URL', value: songInfo.url, inline: true},
          { name: 'คิวที่', value: serverQueue.songs.length, inline: true}
        )
      return message.channel.send(addsong);
    }
}
/*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*/
function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "อยู่ในห้องที่เปิดเพลงก่อนนะแล้วค่อยข้ามเพลง"
        );
    if (!serverQueue)
        return message.channel.send("เพลงหมดแล้วไม่มีให้ฟังต่อแล้ว");
        serverQueue.connection.dispatcher.end();
}
/*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*/
  function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "อยู่ในห้องที่เปิดเพลงก่อนนะแล้วค่อยหยุดเพลง"
        );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    serverQueue.voiceChannel.leave();
}
/*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*/
async function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    const dispatcher = serverQueue.connection
    dispatcher.play(await ytdl(song.url), { type: 'opus' })
    .on("finish", () => {
    if (serverQueue.sl === true){
        console.log("loop");
    }else{
        serverQueue.songs.shift();
        serverQueue.songlist.shift();
    }
    play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));


    console.log('Playing : ' + song.title + ' (' + song.length + ')');
    serverQueue.textChannel.send(
        new Discord.MessageEmbed()
            .setColor('#04ff00')
            .setTitle(botname)
            .setDescription('กำลังเล่นเพลง')
            .setThumbnail(song.thumbnail)
            .addFields(
                { name: 'ชื่อเพลง', value: song.title },
                { name: 'ความยาวเพลง', value: song.length, inline: true},
                { name: 'URL', value: song.url, inline: true}
            )
    );
}
/*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*/
client.login(token);
/*---------------------------------------------------------------------------*/