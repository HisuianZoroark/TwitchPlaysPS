'use strict';
const Tmi = require('tmi.js');
const PSClient = require('ps-client');
global.Config = require('./config/config.js');
const Battle = require('./battle.js');

let session = new Battle(null);
let inBattle = false;

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
	if (!request.length) {
		session = new Battle(room);
		inBattle = true;
	} else {
		session.genOptions(request);
		session.startVote();
	}
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
	if (message.toLowerCase() === '!vote') {
		if (inBattle === false) return;
		let vote = message.toLowerCase().substring(5).trim();
		session.submitVote(author, vote);
	}
});
