require('dotenv').config();
const fetch = require('node-fetch');

// Discord.js versions ^13.0 require us to explicitly define client intents
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const regexLink = /^(?:(?<link>https:\/\/www\.youtube\.com\/watch\?v=(?<videoid>.*)))$/i;
const regexFull = /^(?<artist>.+?) +[-]{1} +(?<song>.+?)(?:(?: *[-]{1} *)(?<link>https:\/\/www\.youtube\.com\/watch\?v=(?<videoid>.*)))?$/i;

client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.CLIENT_TOKEN);

client.on('messageCreate', async msg => {
    if(msg.author.bot) return;
    
    const linkMatch = msg.content.match(regexLink);

    const authorAvatar = msg.author.avatar == null 
                        ? `https://cdn.discordapp.com/embed/avatars/${msg.author.discriminator % 5}.png`
                        : `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}`;

    if(linkMatch != null) {
        await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${linkMatch.groups.videoid}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`)
        .then(res => res.json())
        .then(out => {
            console.log({ input: linkMatch.input, groups: linkMatch.groups });
    
            msg.channel.send({
                embeds: [{
                    author: {
                        name: msg.author.username + " requested",
                        icon_url: authorAvatar
                    },
                    title: out.items[0].snippet.title,
                    url: linkMatch.groups.link
                }]
            })
        });
    } else {
        const match = msg.content.match(regexFull);
        if(match == null) return;
        
        console.log({ input: match.input, groups: match.groups });
        
        msg.channel.send({
            embeds: [{
                author: {
                    name: msg.author.username + " requested",
                    icon_url: authorAvatar
                },
                title: match.groups.artist + " - " + match.groups.song,
                url: match.groups.link
            }]
        })
    }

    /* if(!msg.member.permissions.has("Joachim")) */ msg.delete();
});
