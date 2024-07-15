const Tmi = require('tmi.js');
const PSClient = require('ps-client');
global.Config = require('./config/config.js');

// Connect to PS!
const PS = new PSClient.Client({
	username: Config.Showdown.username,
	password: Config.Showdown.password,
	avatar: Config.Showdown.avatar,
	debug: true,
});
PS.connect();

// Connect to Twitch
const Twitch = new Tmi.Client({
	options: {debug: true},
	identity: {
		username: Config.Twitch.username,
		password: Config.Twitch.oauth,
	},
	channels: [Config.Twitch.streamer],
});
Twitch.connect();

PS.on('message', message => {
	if (message.isIntro) return;
	if (message.content === 'Ping!') return message.reply('Pong!');
});

Twitch.on('message', (channel, tags, message, self) => {
	if (self) return;
	if (message.toLowerCase() === '!hello') {
		Twitch.say(channel, `@${tags.username}, heya!`);
	}
});
