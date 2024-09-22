'use strict';
const Tmi = require('tmi.js');
const PSClient = require('ps-client');
global.Config = require('./config/config.js');

// Connect to PS!
const Ps = new PSClient.Client({
	username: Config.Showdown.username,
	password: Config.Showdown.password,
	avatar: Config.Showdown.avatar,
	debug: true,
});

Ps.connect();

Ps.on('message', message => {
	if (message.isIntro) return;
	if (message.content === '/challenge gen9randombattle@@@TEAMPREVIEW|gen9randombattle@@@TEAMPREVIEW|||') return message.reply('/accept');
	// console.log(message.content);
});
Ps.on('request', (room, request, isIntro) => {
	console.log(request);
	console.log(JSON.parse(request));
});

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

Twitch.on('message', (channel, tags, message, self) => {
	if (self) return;
	if (!message.startsWith(Config.Twitch.prefix)) return;
	const author = tags.username;
	if (message.toLowerCase() === '!hello') {
		Twitch.say(channel, `@${tags.username}, heya!`);
	}
});
