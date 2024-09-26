'use strict';
const Tmi = require('tmi.js');
const PSClient = require('ps-client');
const PokemonShowdown = require('pokemon-showdown');
global.Config = require('./config/config.js');
const Battle = require('./battle.js');
const Dex = PokemonShowdown.Dex;
const Teams = PokemonShowdown.Teams;
let session;
let laddering = false;
let inBattle = false;
let format;
let team = null;

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
		session = new Battle(room, team);
		inBattle = true;
	}
	if (request.length) {
		if (!session.getTeam()) {
		}
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
			if (!isAdmin) {
				twitchChat(`Access denied.`);
				return;
			} else if (laddering) {
				twitchChat(`We're already in a ladder session.`);
				return;
			}
			args = content.split(',');
			format = args[0].trim();
			if (!Dex.formats.get(format).exists) {
				twitchChat(`${format} doesn't seem to be a a proper format.`);
				return;
			}
			if (Dex.formats.get(format).team) {
				team = null;
				console.log('stuff');
			} else {
				pokepaste = args[1].trim();
				team = extractTeam(pokepaste);
				if (!team) {
					twitchChat(`${pokepaste} doesn't seem to be a proper team.`);
					return;
				}
			}
			laddering = true;
			// etc.
			break;
		case 'end':
		case 'endladder':
			if (!isAdmin) {
				twitchChat(`Access denied.`);
				return;
			}
			laddering = false;
			break;
		case 'kill':
			if (!isAdmin) {
				twitchChat(`Access denied.`);
				return;
			}
			process.exit();
			break;
		default:
			twitchChat(`That command does not exist.`);
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
