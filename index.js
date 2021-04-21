/*---------------------------------------------------------------------------*/
const Discord = require("discord.js");
const {prefix, token, yttoken, botname, playcom, skipcom, stopcom, loopcom,listcom, color} = require("./config.json");
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
  });
  
client.once("reconnecting", () => {
  console.log("Reconnecting!");
});
  
client.once("disconnect", () => {
  console.log("Disconnect!");
});
/*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*/
async function normalembed(message, embedtext){
  message.channel.send(
    new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(botname)
    .setDescription(embedtext)
  );
}
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
      else if(loopcom.includes(commans[0])){
        serverQueue.serverloop = !serverQueue.serverloop;
        if(serverQueue.serverloop){
          normalembed(message, "ตอนนี้เราได้ทำการลูปเพลงแรกใน playlist ให้แล้วนะ");
        }else{
          normalembed(message, "ตอนนี้เราได้ทำการปิดการลูปให้แล้วนะ");
        }
        return;
      }else if(commans[0] == "help"){
        const joincom = ", " + prefix
        const p = playcom.join(joincom);
        const sk = skipcom.join(joincom);
        const st = stopcom.join(joincom);
        const lp = loopcom.join(joincom);
        const li = listcom.join(joincom);
        const helpmes = "เปิดเพลงโดยพิมพ์: " + prefix + p + "\nข้ามเพลงโดยพิมพ์: " + prefix + sk + "\nหยุดเล่นเพลงทั้งหมด: " + prefix + st + "\nลูปเพลงที่กำลังเล่น: " + prefix + lp + "\nแสดงรายการเพลง: " + prefix + li
        normalembed(message, helpmes);
        return;
      }else if(listcom.includes(commans[0])){
        const checklist = []
        for(i = 0; i < serverQueue.songs.length;i++){
          const num = i + 1
          const addchecklist = num + "." + serverQueue.songs[i].title
          checklist.push(addchecklist)
        }
        normalembed(message, checklist.join("\n"));
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
      normalembed(message, "เข้าไปห้องคุยแบบเสียงก่อนสิเดียวเปิดเพลงให้");
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      normalembed(message, "เราไม่มีสิทธิเข้าห้องรนั้นอะ");
    }
    args.shift();
    const songInfo = await youtube.searchVideos(args.join("_"));
    const song = {
      title: songInfo.title,
      url: songInfo.url,
      length: songInfo.length,
      thumbnail: songInfo.thumbnail
    }

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        serverloop: false,
        cl: 0,
        vol: 100,
        playing: true
      };
      queue.set(message.guild.id, queueContruct);
      queueContruct.songs.push(song);
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
      return message.channel.send(
          new Discord.MessageEmbed()
          .setColor(color)
          .setTitle(botname)
          .setDescription('ทำการเพิ่มเพลง')
          .setThumbnail(songInfo.thumbnail)
          .addFields(
            { name: 'ชื่อเพลง', value: songInfo.title },
            { name: 'ความยาวเพลง', value: songInfo.length, inline: true},
            { name: 'URL', value: songInfo.url, inline: true},
            { name: 'คิวที่', value: serverQueue.songs.length, inline: true}
          )
      );
    }
}
/*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*/
function skip(message, serverQueue) {
    if (!message.member.voice.channel)
      normalembed(message, "อยู่ในห้องที่เปิดเพลงก่อนนะแล้วค่อยข้ามเพลง");
    if (!serverQueue)
      normalembed(message, "เพลงหมดแล้วไม่มีให้ข้ามแล้ว");
      serverQueue.connection.dispatcher.end();
}
/*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*/
  function stop(message, serverQueue) {
    if (!message.member.voice.channel)
      normalembed(message, "อยู่ในห้องที่เปิดเพลงก่อนนะแล้วค่อยหยุดเพลง");
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
    if (serverQueue.serverloop === true){
        console.log("loop");
        play(guild, serverQueue.songs[0]);
    }else{
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    }
    })
    .on("error", error => console.error(error));
    console.log('Playing : ' + song.title + ' (' + song.length + ')');
    serverQueue.textChannel.send(
        new Discord.MessageEmbed()
            .setColor(color)
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