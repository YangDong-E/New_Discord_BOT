const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const queue = new Map();
// queue(message.guild.id, queue_constructor object{ voice channel, text channel, connection, song[]})
module.exports = {
    name: 'p',
    aliases: ['s', 'stop'],
    description: 'Advanced music bot',
    async excute(message, args, cmd, client, Discord) {
        const voice_channel = message.member.voice.channel;
        if (!voice_channel)
            return message.channel.send(
                '음성 채널에 들어가서 명령어를 입력해 주세요.'
            );
        const permissions = message.member.permissions;
        if (!permissions.has('CONNECT'))
            return message.channel.send('권한이 없습니다.');
        if (!permissions.has('SPEAK'))
            return message.channel.send('권한이 없습니다.');

        const server_queue = queue.get(message.guild.id);

        if (cmd === 'p') {
            if (!args.length)
                return message.channel.send('제목 이나 링크를 입력해 주세요.');
            let song = {};

            if (ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                song = {
                    title: song_info.videoDetails.title,
                    url: song_info.videoDetails.video_url,
                };
            } else {
                // If the video is not a URL then use keywords to find that video
                const video_finder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return videoResult.videos.length > 1
                        ? videoResult.videos[0]
                        : null;
                };
                const video = await video_finder(args.join(' '));
                if (video) {
                    song = { title: video.title, url: video.url };
                } else {
                    message.channel.send('Error finding video.');
                }
                if (!server_queue) {
                    const queue_constructor = {
                        voice_channel: voice_channel,
                        text_channel: message.channel,
                        connection: null,
                        songs: [],
                    };

                    queue.set(message.guild.id, queue_constructor);
                    queue_constructor.songs.push(song);

                    try {
                        const connection = await voice_channel.join();
                        queue_constructor.connection = connection;
                        video_player(message.guild, queue_constructor.songs[0]);
                    } catch (err) {
                        queue.delete(message.guild.id);
                        message.channel.send('There was an error connecting!');
                        throw err;
                    }
                } else {
                    server_queue.songs.push(song);
                    return message.channel.send(
                        `👍 **${song.title}** 를 추가했습니다.`
                    );
                }
            }
        } else if (cmd === 's') skip_song(message, server_queue);
        else if (cmd === 'stop') stop_song(message, server_queue);
    },
};

const video_player = async (guild, song) => {
    const song_queue = queue.get(guild.id);

    if (!song) {
        song_queue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }
    const stream = ytdl(song.url, { filter: 'audioonly' });
    song_queue.connection
        .play(stream, { seek: 0, volume: 0.5 })
        .on('finish', () => {
            song_queue.songs.shift();
            video_player(guild, song_queue.songs[0]);
        });
    await song_queue.text_channel.send(`🐳 Now playing **${song.title}**`);
};

const skip_song = (message, server_queue) => {
    if (!message.member.voice.channel)
        return message.channel.send(
            'You need to be in a channel to execute this command!'
        );
    if (!server_queue) {
        return message.channel.send(`There are no songs in queue 😔`);
    }
    server_queue.connection.dispatcher.end();
};

const stop_song = (message, server_queue) => {
    if (!message.member.voice.channel)
        return message.channel.send(
            'You need to be in a channel to execute this command!'
        );
    server_queue.songs = [];
    server_queue.connection.dispatcher.end();
};

// module.exports = {
//     name: 'p',
//     description: 'Joins and plays a video from youtube',
//     async excute(client, message, args) {
//         const voiceChannel = message.member.voice.channel;

//         if (!voiceChannel)
//             return message.channel.send(
//                 '음성 채널에 들어가서 명령어를 입력해 주세요.'
//             );
//         const permissions = message.member.permissions;
//         if (!permissions.has('CONNECT'))
//             return message.channel.send('권한이 없습니다.');
//         if (!permissions.has('SPEAK'))
//             return message.channel.send('권한이 없습니다.');
//         if (!args.length)
//             return message.channel.send('제목 이나 링크 를 입력해 주세요.');

//         const connection = await voiceChannel.join();

//         const videoFinder = async (query) => {
//             const viedoResult = await ytSearch(query);

//             return viedoResult.videos.length > 1 ? viedoResult.videos[0] : null;
//         };

//         const video = await videoFinder(args.join(' '));
//         if (video) {
//             const stream = ytdl(video.url, { filter: 'audioonly' });
//             connection.play(stream, { seek: 0, volume: 1 }).on('l', () => {
//                 voiceChannel.leave();
//             });

//             await message.reply(`:thumbsup: Now Playing ***${video.title}***`);
//         } else {
//             message.channel.send('No video results found');
//         }
//     },
// };
