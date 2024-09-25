'use strict';
const Tmi = require('tmi.js');
const PSClient = require('ps-client');
global.Config = require('./config/config.js');
const Battle = require('./battle.js');

let session;
let laddering = false;
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
	if (!session) {
		session = new Battle(room);
		inBattle = true;
	}
	if (request.length) {
		session.genOptions(request);
		session.startVote();
	}
});

Ps.on('win', (room, request, isIntro) => {
	session.leave();
	// Ps.rooms.get(room).send('/part');
	if (laddering) {

	} else {

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
	if (self || !message.startsWith(Config.Twitch.prefix)) return;
	const author = tags.username;
	let args = message.slice(1).split(' ');
	let command = args.shift().toLowerCase();
	let content = args.join(' ');
	let isAdmin = [Config.Twitch.streamer].concat(Config.Twitch.sysops).includes(author);
	switch (command) {
		case 'v':
		case 'vote':
			if (inBattle === false || !session) {
				twitchChat(`${author} we aren't in a battle yet!`);
				return;
			}
			session.submitVote(author, content);
			break;
		case 'start':
		case 'startladder':
			//code
			break;
		case 'end':
		case 'endladder':
			laddering = false;
			break;
		case 'kill':
			if (isAdmin) process.exit();
			break;
		default:
			twitchChat(`${author} that command does not exist.`);
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
