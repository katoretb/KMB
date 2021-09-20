/*import ---------------------------------------------------------------------------*/
const fetch = require('node-fetch');
const Discord = require("discord.js");
const TicTacToe = require('discord-tictactoe');
const {prefix, token, yttoken, botname, playcom, skipcom, stopcom, loopcom, listcom, covidcom, infocom, tictactoecom, color} = require("./config.json");
const ytdl = require("ytdl-core-discord");
const YouTube = require("discord-youtube-api");
const youtube = new YouTube(yttoken);
const client = new Discord.Client();
const game = new TicTacToe({ language: 'th' })
var search = require('youtube-search');

const queue = new Map();
/*---------------------------------------------------------------------------*/

/*console  log bot status---------------------------------------------------------------------------*/
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

/*send embed---------------------------------------------------------------------------*/
async function normalembed(message, embedtext){
  message.channel.send(
    new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(botname)
    .setDescription(embedtext)
  );
}

function checklast(serverQueue, em) {
  serverQueue.textChannel.messages.fetch(serverQueue.textChannel.lastMessageID).then( (lastusername) => {
    if(lastusername.author.username == "KatoMusic") {
      lastusername.edit(em)
    }else{
      serverQueue.textChannel.send(em);
    }
  });
}

/*---------------------------------------------------------------------------*/

/*check command---------------------------------------------------------------------------*/
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
      }else if(loopcom.includes(commans[0])){
        serverQueue.serverloop = !serverQueue.serverloop;
        if(serverQueue.serverloop){
          normalembed(message, "ตอนนี้เราได้ทำการลูปเพลงใน playlist ให้แล้วนะ");
        }else{
          normalembed(message, "ตอนนี้เราได้ทำการปิดการลูปให้แล้วนะ");
        }
        return;
      }else if(commans[0] == "help"){
        const joincom = ", " + prefix
        const p = prefix + playcom.join(joincom);
        const sk = prefix + skipcom.join(joincom);
        const st = prefix + stopcom.join(joincom);
        const lp = prefix + loopcom.join(joincom);
        const li = prefix + listcom.join(joincom);
        const tttg = prefix + tictactoecom.join(joincom);
        message.channel.send(
          new Discord.MessageEmbed()
              .setColor(color)
              .setTitle(botname)
              .setThumbnail("https://www.pngkey.com/png/full/205-2054169_support-icon-png-for-kids-can-i-help.png")
              .setDescription(message.author.toString())
              .addFields(
                  { name: 'เปิดเพลง ▶️', value: p,inline: true},
                  { name: 'ข้ามเพลง ⏭', value: sk,inline: true},
                  { name: 'หยุดเพลง ⏹', value: st,inline: true},
                  { name: 'ลูปเพลง 🔁', value: lp,inline: true},
                  { name: 'แสดงรายการเพลง 🔢', value: li,inline: true},
                  { name: 'เล่นเกม ❌⭕️', value: li,inline: true}
              )
        );
        return;
      }else if(listcom.includes(commans[0])){
        const checklist = []
        for(i = 0; i < serverQueue.songs.length;i++){
          const num = i + 1
          const addchecklist = num + "." + serverQueue.songs[i].title
          checklist.push(addchecklist)
        }
        normalembed(message, checklist.join("\n"));
      }else if(tictactoecom.includes(commans[0])) {
        game.handleMessage(message);
      }else if(covidcom.includes(commans[0])) {
        const covidcheck = new Promise((resolve, reject) => {
          fetch("https://static.easysunday.com/covid-19/getTodayCases.json", { method: "Get" })
            .then(res => res.json())
            .then((json) => {
              resolve(json)
            });
        });
        
        covidcheck.then((json) => {
          message.channel.send(
            new Discord.MessageEmbed()
              .setColor(color)
              .setTitle(botname)
              .setDescription('ข้อมูล covid')
              .setThumbnail("https://cdn.pixabay.com/photo/2020/04/29/07/54/coronavirus-5107715_1280.png")
              .addFields(
                { name: "\u200B", value: "\u200B", inline: false},
                { name: "วันนี้", value: "\u200B", inline: false},
                { name: "ติดเชื้อ", value: json.todayCases, inline: true},
                { name: "หายป่วย", value: json.todayRecovered, inline: true},
                { name: "เสียชีวิต", value: json.todayDeaths, inline: true},
                { name: "\u200B", value: "\u200B", inline: false},
                { name: "สะสม", value: "\u200B", inline: false},
                { name: "ติดเชื้อ", value: json.cases, inline: true},
                { name: "หายป่วย", value: json.recovered, inline: true},
                { name: "เสียชีวิต", value: json.deaths, inline: true},
                { name: "\u200B", value: "\u200B", inline: false},
                { name: "อัพเดตล่าสุด", value: json.UpdateDate, inline: false}
              ))
        });
      }else if(infocom.includes(commans[0])){
        normalembed(message, "Creator: katoriTV#5571\n" + "Joined: " + client.guilds.cache.size + " Servers")
        return;
      }else{
        normalembed(message, "คำสั่งไรอะไม่เห็นรู้จักเลยลองใช้ " + prefix + "help เพื่อดูคำสั่งต่างๆ")
        return;
      }
    }
}
);
/*---------------------------------------------------------------------------*/

/*command play search---------------------------------------------------------------------------*/
async function execute(message, serverQueue) {   
  let args = message.content.split(" ");
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    normalembed(message, "เข้าไปห้องคุยแบบเสียงก่อนสิเดียวเปิดเพลงให้");
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    normalembed(message, "เราไม่มีสิทธิเข้าห้องรนั้นอะ");
  }
  args.shift();
  if(!args[0].startsWith("https://")){
    const Searching = new Promise((resolve, reject) => {
      search(args.join("_"), {maxResults: 5,key: yttoken}, function(err, results) {
        if(err) return console.log(err);
        resolve(results)
      })
    });
    Searching.then((VDOL) => {
      selectmenu(message, VDOL, serverQueue, voiceChannel)
    });
  } else {
    args = args.join("/");
    args = args.split("/");
    args = args[args.length-1];
    if(args.search("list") < 0){
      args = args.split("=");
      const VDOID = args[args.length-1];
      execute2(message, serverQueue, VDOID, voiceChannel, 1)
    }else{
        args = args.split("=");
        const VDOID = args[args.length-1];
        execute2(message, serverQueue, VDOID, voiceChannel, 2)
    }
  }
}
/*---------------------------------------------------------------------------*/

/*Select song menu---------------------------------------------------------------------------*/
async function selectmenu(message, VDOL, serverQueue, voiceChannel) {
  let mes = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle('เลือกเพลง')
    .setDescription("1️⃣ " + VDOL[0].title + "\n2️⃣ " + VDOL[1].title + "\n3️⃣ " + VDOL[2].title + "\n4️⃣ " + VDOL[3].title +"\n5️⃣ " + VDOL[4].title)
  let msg = await message.channel.send(mes)
  msg.react('1️⃣')
    .then(() => msg.react('2️⃣'))
    .then(() => msg.react('3️⃣'))
    .then(() => msg.react('4️⃣'))
    .then(() => msg.react('5️⃣'))
    .then(() => msg.react('❌'))
  const filter = (reaction, user) => {
    return user.id === message.author.id;
  };
  msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
    .then(collected => {
      const reaction = collected.first();
      if(reaction.emoji.name == '1️⃣'){
        msg.reactions.removeAll();
        execute2(message, serverQueue, VDOL[0].id, voiceChannel, 1)
        return;
      } else if(reaction.emoji.name == '2️⃣') {
        msg.reactions.removeAll();
        execute2(message, serverQueue, VDOL[1].id, voiceChannel, 1)
        return;
      } else if(reaction.emoji.name == '3️⃣') {
        msg.reactions.removeAll();
        execute2(message, serverQueue, VDOL[2].id, voiceChannel, 1)
        return;
      } else if(reaction.emoji.name == '4️⃣') {
        msg.reactions.removeAll();
        execute2(message, serverQueue, VDOL[3].id, voiceChannel, 1)
        return;
      } else if(reaction.emoji.name == '5️⃣') {
        msg.reactions.removeAll();
        execute2(message, serverQueue, VDOL[4].id, voiceChannel, 1)
        return;
      } else {
        msg.delete()
        return;
      }
    })
    .catch(collected => {
      normalembed(message, "คุณเลือกช้าไป");
    });
}
/*---------------------------------------------------------------------------*/

/*command play get VDO data---------------------------------------------------------------------------*/
async function execute2(message, serverQueue, VDOID, voiceChannel, state){
  if(state == 1){
    let songInfo = await youtube.getVideoByID(VDOID);
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
        countloop: 0,
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
      let em = new Discord.MessageEmbed()
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
      return checklast(serverQueue, em)
    }
  }else{
    const videoArray2 = await youtube.getPlaylistByID(VDOID);
    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        serverloop: false,
        countloop: 0,
        vol: 100,
        playing: true
      };
      queue.set(message.guild.id, queueContruct);
      for(i=0; i < videoArray2.length; i++){
        let songInfo = await youtube.getVideoByID(videoArray2[i].id);
        let song = {
          title: songInfo.title,
          url: songInfo.url,
          length: songInfo.length,
          thumbnail: songInfo.thumbnail
        }
        queueContruct.songs.push(song);
      }
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
      const checklist = []
        for(i = 0; i < queueContruct.songs.length;i++){
          const num = i + 1
          const addchecklist = num + "." + queueContruct.songs[i].title
          checklist.push(addchecklist)
        }
        normalembed(message, checklist.join("\n"));
    }else{
      for(i=0; i < videoArray2.length; i++){
        let songInfo = await youtube.getVideoByID(videoArray2[i].id);
        let song = {
          title: songInfo.title,
          url: songInfo.url,
          length: songInfo.length,
          thumbnail: songInfo.thumbnail
        }
        serverQueue.songs.push(song);
      }
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
/*---------------------------------------------------------------------------*/

/*command skip---------------------------------------------------------------------------*/
function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    normalembed(message, "อยู่ในห้องที่เปิดเพลงก่อนนะแล้วค่อยข้ามเพลง");
  if (!serverQueue)
    normalembed(message, "เพลงหมดแล้วไม่มีให้ข้ามแล้ว");
    serverQueue.connection.dispatcher.end();
}
/*---------------------------------------------------------------------------*/

/*command stop---------------------------------------------------------------------------*/
function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    normalembed(message, "อยู่ในห้องที่เปิดเพลงก่อนนะแล้วค่อยปิดเพลง");
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end()
  serverQueue.voiceChannel.leave();
}
/*---------------------------------------------------------------------------*/

/*play song---------------------------------------------------------------------------*/
async function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      if(serverQueue.textChannel.lastMessage.author.username == "KatoMusic"){
        serverQueue.textChannel.lastMessage.delete()
      }
      queue.delete(guild.id);
      serverQueue.textChannel.send(
        new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(botname)
            .setDescription('เพลงหมดแล้วจร้า')
      );
      serverQueue.songs = [];
      serverQueue.voiceChannel.leave();
      return;
    }
    const dispatcher = serverQueue.connection
    dispatcher.play(await ytdl(song.url), { type: 'opus' })
    .on("finish", () => {
    if (serverQueue.serverloop === true){
      if(serverQueue.countloop < (serverQueue.songs.length)-1){
        serverQueue.countloop++;
        play(guild, serverQueue.songs[serverQueue.countloop]);
      }else{
        serverQueue.countloop = 0;
        play(guild, serverQueue.songs[0]);
      }
    }else{
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    }
    })
    .on("error", error => console.error(error));
    console.log('Playing : ' + song.title + ' (' + song.length + ')');

    let em = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(botname)
    .setDescription('กำลังเล่นเพลง')
    .setThumbnail(song.thumbnail)
    .addFields(
        { name: 'ชื่อเพลง', value: song.title },
        { name: 'ความยาวเพลง', value: song.length, inline: true},
        { name: 'URL', value: song.url, inline: true}
    )
    checklast(serverQueue, em)
}
/*---------------------------------------------------------------------------*/

/*if kiked from voice---------------------------------------------------------------------------*/

client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.channelID === null || typeof oldState.channelID == 'undefined' && !serverQueue) return;
    if (newState.id !== client.user.id) return;
    const serverQueue = queue.get(oldState.guild.id);
    queue.delete(oldState.guild.id);
    serverQueue.textChannel.send(
      new Discord.MessageEmbed()
          .setColor(color)
          .setTitle(botname)
          .setDescription('กำลังเปิดเพลงให้เลยอย่าเตะกันสิ')
    );
    serverQueue.songs = [];
    serverQueue.voiceChannel.leave();
    return;
})
/*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*/
client.login(token);
/*---------------------------------------------------------------------------*/
