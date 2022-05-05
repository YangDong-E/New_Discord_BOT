module.exports = {
    name: 'ping',
    description: 'this is a ping command!',
    excute(client, message, args) {
        message.channel.send('pong!');
    },
};
