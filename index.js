require('dotenv').config();
const fetch = require('node-fetch');

// Discord.js versions ^13.0 require us to explicitly define client intents
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.CLIENT_TOKEN);

const cmd = "!learn";

client.on('messageCreate', async msg => {
    if(msg.author.bot) return;

    if (msg.content.startsWith(cmd)) {
        const regex = /^(?<artist>.+?) +[-]{1} +(?<song>.+?)(?:(?: *[-]{1} *)(?<link>https:\/\/www\.youtube\.com\/watch\?v=(?<videoid>.*)))?$/i;
        const matchThis = msg.content.substring(cmd.length+1);

        const match = matchThis.match(regex);

        console.log(matchThis);
        console.log(match);

        /* let embedTitle;

        if(match.groups.videoid != undefined) {
            let videoTitle = "";
            
            await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${match.groups.videoid}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`)
            .then(res => res.json())
            .then(out => {
                videoTitle = out.items[0].snippet.title;
            });
            console.log(videoTitle);

            if(videoTitle.toLowerCase().indexOf(match.groups.artist)
        } */

        msg.channel.send({
            embeds: [{
                author: {
                    name: msg.author.username + " requested",
                    icon_url: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}`
                },
                title: match.groups.artist + " - " + match.groups.song,
                url: match.groups.link
            }]
        })

        msg.delete();
    }
});

