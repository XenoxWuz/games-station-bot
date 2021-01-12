var Discord = require('discord.js');
var fs = require('fs');
var bot = new Discord.Client();
var google = require('googleapis');
const imageSearch = require('image-search-google');
const { executionAsyncResource } = require('async_hooks');

var userData = JSON.parse(fs.readFileSync('storage/userData.json', 'utf8'));
var serverData = JSON.parse(fs.readFileSync('storage/serverData.json', 'utf8'));
const queue = new Map();

function userStats (user) {
    return {embed:{
            title: 'Stats von ' + user.username,
            description: 'Hier sind deine Stats!',
            color: 0x00bf23,
            fields: [
                {
                    name: 'Gesendete Nachrichten',
                    value: 'Insgesamt gesendet: ' + userData[user.id].messagesSent,
                    inline: true
                },
                {
                    name: ' an den MusikBot',
                    value: 'Musik befehle: ' + musicStats(user.id) + '\n' + 
                            '- play: ' + userData[user.id].music.play + '\n' + 
                            '- pause: ' + userData[user.id].music.pause + '\n' + 
                            '- stop: ' + userData[user.id].music.stop + '\n' + 
                            '- shuffle: ' + userData[user.id].music.shuffle + '\n' + 
                            '- skip: ' + userData[user.id].music.skip + '\n' + 
                            '- repeat: ' + userData[user.id].music.repeat + '\n',
                    inline: true
                }
            ]
        }
    }
}

function musicStats (userId) {
    var finalResult = 0;

    finalResult += userData[userId].music.play
    finalResult += userData[userId].music.pause
    finalResult += userData[userId].music.stop
    finalResult += userData[userId].music.shuffle
    finalResult += userData[userId].music.skip
    finalResult += userData[userId].music.repeat

    return finalResult;
}

function help (user) {
    return {
        embed: {
            title: 'Hilfe für ' + user.username,
            description: 'Du brauchst wirklich Hilfe??!! Shame on You!',
            color: 0xe3001e,
            fields: [
                {
                    name: 'Basic Commands',
                    value: '.ping --Der Bot antwortet mit PONG',
                    inline: false
                },
                {
                    name: 'Help',
                    value: '.help --Der Bot zeigt das Hilfsmenü\n' + 
                            '.commands --Der Bot zeigt das Hilfsmenü\n',
                    inline: false
                }
            ]
        }
    }
}

bot.on('message', async message => {


    userData = JSON.parse(fs.readFileSync('storage/userData.json', 'utf8'));

    var sender = message.author;
    var msg = message.content;
    var prefix = '.'

    if (sender.id === '724345218568028160') {
        return;
    }

    if (msg.includes('noob') || msg.includes('Noob')) {
        message.delete();
        message.author.send('Das Wort "NOOB" ist geblockt.')
    }

    if (msg.includes('arsch') || msg.includes('Arsch')) {
        message.delete();
        message.author.send('Das Wort "Arsch" ist geblockt.')
    }

    if (msg === prefix + 'ping') {
        message.channel.send('Pong!')
    }

    if (!userData[sender.id]) userData[sender.id] = {
        username: sender.username,
        messagesSent: 0,
        coins: 0,
        music: {
            play: 0,
            pause: 0,
            stop: 0,
            shuffle: 0,
            skip: 0,
            repeat: 0
        }
    }

    userData[sender.id].messagesSent++;

    if (message.channel.id === '704380956861005934') {
        if (msg.startsWith('-PLAY') || msg.startsWith('-play') || msg.startsWith('-Play')) userData[sender.id].music.play++;
        else if (msg.startsWith('-PAUSE') || msg.startsWith('-pause') || msg.startsWith('-Pause')) userData[sender.id].music.pause++;
        else if (msg.startsWith('-STOP') || msg.startsWith('-stop') || msg.startsWith('-Stop')) userData[sender.id].music.stop++;
        else if (msg.startsWith('-SHUFFLE') || msg.startsWith('-shuffle') || msg.startsWith('-Shuffle')) userData[sender.id].music.shuffle++;
        else if (msg.startsWith('-SKIP') || msg.startsWith('-skip') || msg.startsWith('-Skip') || msg.startsWith('-next') || msg.startsWith('-Next')) userData[sender.id].music.skip++;
        else if (msg.startsWith('-REPEAT') || msg.startsWith('-repeat') || msg.startsWith('-Repeat')) userData[sender.id].music.repeat++;

        
    }

    const serverQueue = queue.get(message.guild.id);

    if (msg === prefix + 'test') {
        message.edit('Test123')
    }

    if (msg === prefix + 'stats') {
        message.delete();
        message.channel.send(userStats(sender));
    }

    if (msg === prefix + 'help' || msg === prefix + 'commands') {
        message.delete();
        message.channel.send(help(sender));
    }

    if (msg.startsWith(prefix + 'roulette')) {
        var bet = message.content.split(' ')[1]
        var bid = message.content.split(' ')[2]
    }

    if (msg.startsWith(prefix + 'move')) {
        var param1 = message.content.split(' ')[1]
        var param2 = message.content.split(' ')[2]
        var movemember = message.guild.channels.cache
        var goalchannel
        var log
        if (param2 === undefined) {
            message.guild.channels.cache.forEach(channel => {
                if (channel.type === "voice") {
                    if (channel.members.find(findXenox) !== undefined) {
                        movemember = channel.members;
                    } else if (channel.name === param1) {
                        goalchannel = channel
                    }
                }
            })
        } else if (serverData[message.guild.id].voiceChannels.includes(param1)) {
            message.guild.channels.cache.forEach(channel => {
                if (channel.type === "voice") {
                    if (channel.name === param1) {
                        log = movemember = channel.members;
                    } else if (channel.name === param2) {
                        goalchannel = channel
                    }
                }
            })
        } else {
            message.guild.channels.cache.forEach(channel => {
                if (channel.type === "voice") {
                    if (channel.name === param2) {
                        goalchannel = channel
                    }
                }
            })
            message.guild.members.cache.forEach(user => {
                if (user.user.username === param1) {
                    movemember = user.guild.channels.cache
                    movemember.clear()
                    movemember.set(user.user.id, user)
                }
            })
        }

        if (movemember !== null && movemember !== undefined) {
            movemember.forEach(member => {
                member.voice.setChannel(goalchannel)
            })
        }
    }

    if (msg.startsWith(prefix + 'allstats')) {
        if (sender.id === '285712574828249088') {
            message.channel.send(userData);
        }
    }

    fs.writeFile('storage/userData.json', JSON.stringify(userData, null, 4), (err) => {
        if (err) console.error(err);
    })

});

bot.on('ready', () => {

    console.log("Bot Launched ...");

    bot.user.setStatus('online');
    bot.user.setActivity('.help');

    for (var value in userData) {
        if (userData[value].mute === undefined || userData[value].mute < 1) {
            userData[value].mute = 0;
        }
        if (userData[value].unmute === undefined || userData[value].unmute < 1) {
            userData[value].unmute = 0;
        }
    }

    bot.guilds.cache.forEach(server => {
        var voiceChannels = []
        var textChannels = []
        server.channels.cache.forEach(channel => {
            if (channel.type === "voice") {
                voiceChannels.push(channel.name)
            } else if (channel.type === "text") {
                textChannels.push(channel.name)
            }
        })
        serverData[server.id] = {
            "name": server.name,
            "memberCount": server.memberCount,
            "voiceChannelCount": voiceChannels.length,
            "voiceChannels": voiceChannels,
            "textChannelCount": textChannels.length,
            "textChannels": textChannels,
        }
    })

    fs.writeFile('storage/userData.json', JSON.stringify(userData, null, 4), (err) => {
        if (err) console.error(err);
    })

    fs.writeFile('storage/serverData.json', JSON.stringify(serverData, null, 4), (err) => {
        if (err) console.error(err);
    })

});


bot.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.channel
    let oldUserChannel = oldMember.channel;

    userData = JSON.parse(fs.readFileSync('storage/userData.json', 'utf8'));

    if (newUserChannel !== null && newUserChannel !== oldUserChannel) {
        console.log(userData[oldMember.id].username + " joins " + newUserChannel)
        if (userData[oldMember.id].join === 0) {
            userData[oldMember.id].join = Date.now();
            userData[oldMember.id].currentChannel = newUserChannel.name;
        } else {
            userData[oldMember.id].coins += (Date.now() - userData[oldMember.id].join) / 1000;
            userData[oldMember.id].join = Date.now();
            userData[oldMember.id].currentChannel = newUserChannel.name;
        }
    } else if (newUserChannel === null) {
        console.log(userData[oldMember.id].username + " leafes the Cannel")
        userData[oldMember.id].coins += (Date.now() - userData[oldMember.id].join) / 1000;
        userData[oldMember.id].join = 0;
    } else if (oldMember.selfMute === false && newMember.selfMute === true) {
        //userData[oldMember.id].mute += 1;
    } else if (oldMember.selfMute === true && newMember.selfMute === false) {
        //userData[oldMember.id].unmute += 1;
    }

    fs.writeFile('storage/userData.json', JSON.stringify(userData, null, 4), (err) => {
        if (err) console.error(err);
    })
})

bot.on('guildMemberAdd', member => {

    console.log('User ' + member.user.username + ' has joined the server!')
    //var role = member.guild.roles.find('name', 'User');
    //member.addRole(role);
    //member.guild.channels.get('?').send('Send Text');

});

function findXenox(item) {
    return item.user.username === 'Xenox'
}

bot.login(process.env.BOT_TOKEN);