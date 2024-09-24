'use strict';
const Tmi = require('tmi.js');
const PSClient = require('ps-client');
global.Config = require('./config/config.js');
const Battle = require('./battle.js');

let session;
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
	//console.log(Ps.rooms);
	if (message.content === '/challenge gen9randombattle@@@TEAMPREVIEW|gen9randombattle@@@TEAMPREVIEW|||') return message.reply('/accept');
	// console.log(message.content);
});
Ps.on('request', (room, request, isIntro) => {
	if (!request.length || !session) {
		session = new Battle(room);
		inBattle = true;
	}
	session.genOptions(request);
	session.startVote();
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
	console.log(channel);
	if (!message.startsWith(Config.Twitch.prefix)) return;
	const author = tags.username;
	if (message.toLowerCase() === '!vote') {
		if (inBattle === false || !session) return;
		let vote = message.toLowerCase().substring(5).trim();
		session.submitVote(author, vote);
	}
});

function makeDecision(message, room) {
	console.log(Ps.rooms);
	console.log(room);
	Ps.rooms.get(room).send(message);
}
global.makeDecision = makeDecision;

function twitchChat(message) {
	let channel = '#' + Config.Twitch.streamer;
	Twitch.say(channel, message);
}
global.twitchChat = twitchChat;
