require('dotenv').config();
const fetch = require('node-fetch');

const { Client, Intents } = require('discord.js');
const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES
    ] 
});

const joacServerId = "908856175049736202";
const testChannelId = "992448812054495253";
const musicRequestChannelId = "971498236076490783";
const regexLink = /^(?:(?<link>(?:https:\/\/www\.youtube\.com\/watch\?v=|https:\/\/youtu.be\/)(?<videoid>.*)))$/i;
const regexFull = /^(?<artist>.+?) +- +(?<song>.+?)(?: *- +?(?<link>.*))?$/i;
const joachimRole = "969046767511429210";
const staffRole = "896304904421916723";
const albinaRole = "896304369451012147";

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.CLIENT_TOKEN);

client.on('messageCreate', msg => {
    const channelToWorkIn = msg.guild.id == joacServerId ? testChannelId : musicRequestChannelId;
    const roleToExclude = msg.guild.id == joacServerId ? joachimRole : staffRole;
    
    if(msg.channel.id != channelToWorkIn) return;
    if(msg.author.bot) return;
    
    const linkMatch = msg.content.match(regexLink);
    
    const authorAvatar = msg.author.avatar == null 
                            ? `https://cdn.discordapp.com/embed/avatars/${msg.author.discriminator % 5}.png`
                            : `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}`;
    
    if(linkMatch != null) {     // If the user entered only link
        fetch(`https://www.googleapis.com/youtube/v3/videos?id=${linkMatch.groups.videoid}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`)
        .then(res => res.json())
        .then(out => {
            console.log("Successful input by " + msg.author.username + "#" + msg.author.discriminator + ": ");
            console.log({ input: linkMatch.input, groups: linkMatch.groups });

            const regexVideoTitleOnlySongname = /^(?<song>(?:[a-z|A-Z| |0-9])+?)$/;

            let videoTitle = out.items[0].snippet.title;

            if(regexVideoTitleOnlySongname.test(videoTitle)) {
                const matchVideoDescription = out.items[0].snippet.description.match(/(?<song>.+?) +[-|??]{1} +(?<artist>[^\n]+)/);
                if(matchVideoDescription != null) {
                    const artist = matchVideoDescription.groups.artist.replace(" ?? ", ", ");
                    videoTitle = artist + " - " + matchVideoDescription.groups.song;
                }
            } else videoTitle = videoTitle.replace(/ {1}[\(|\[](Official(\w| )*?|(\w| )*? Video|(\w| )*?Audio)[)|\]]/i, "");    

            msg.channel.send({
                embeds: [{
                    author: {
                        name: msg.author.username + " requested",
                        icon_url: authorAvatar
                    },
                    title: videoTitle,
                    url: linkMatch.groups.link
                }]
            });
        });

        msg.delete();
    } else {    // If the user entered artist and song (and maybe link)
        const match = msg.content.match(regexFull);
        if(match != null) {
            if(regexLink.test(match.groups.link)) {
                console.log("Successful input by " + msg.author.username + "#" + msg.author.discriminator + ": ");
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
                });
            }
            else {
                console.log("Invalid link used in input by " + msg.author.username + "#" + msg.author.discriminator + ": ");
                console.log({ input: msg.content });
                
                msg.channel.send({
                    embeds: [{
                        title: "Invalid link. Only YouTube links are accepted."
                    }]
                }).then(message => setTimeout(() => message.delete(), 10000));
            }

            msg.delete();
        }
        else {    // If the user entered wrong input
            console.log("Invalid input by " + msg.author.username + "#" + msg.author.discriminator + ": ");
            console.log({ input: msg.content });
            if(!msg.member.roles.cache.has(roleToExclude) && !msg.member.roles.cache.has(albinaRole)) {
                msg.channel.send({
                    embeds: [{
                        title: "Invalid format. Use one of the following ways to request a song:",
                        description: "[link]\n[artist] - [song] - [link]\n[artist] - [song]\n\nFor examples, see the pinned message."
                    }]
                }).then(message => setTimeout(() => message.delete(), 15000));

                msg.delete();   // Delete message if user does not have the "Joachim"/"Staff"/"Albina" role
            }
        }
    }
});
