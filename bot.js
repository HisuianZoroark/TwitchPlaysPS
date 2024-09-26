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
let pokepaste = 'No team link provided.';

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
Ps.on('popup', (room, message, isIntro) => {
	if (message.startsWith(`Your team was rejected for the following reasons:`)) {
		laddering = false;
		Ps.send('/cancelsearch');
	}
	console.log(message);
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
		Ps.send(`/utm ${team}`);
		Ps.send(`/search ${format}`);
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
		case 'ladder':
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
			if (!Dex.formats.get(format).exists || !Dex.formats.get(format).searchShow) {
				twitchChat(`${format} doesn't seem to be a a proper format.`);
				return;
			}
			if (Dex.formats.get(format).team) {
				team = null;
			} else {
				let link = args[1].trim();
				if (link.match(/https:\/\/pokepast\.es\/(.*)$/)) {
					extractTeam(link);
				}
				console.log(pokepaste);
				console.log(team);
				if (!team) return;
			}
			// laddering = true;
			// Ps.send(`/utm ${team}`);
			// Ps.send(`/search ${format}`);
			break;
		case 'end':
		case 'stop':
		case 'endladder':
			if (!isAdmin) {
				twitchChat(`Access denied.`);
				return;
			}
			laddering = false;
			Ps.send('/cancelsearch');
			break;
		case 'kill':
			if (!isAdmin) {
				twitchChat(`Access denied.`);
				return;
			}
			process.exit();
			break;
		case 'team':
			twitchChat(`${team}`);
			break;
		// case 'pic':
		// case 'partnersincrime':
		// 	twitchChat(`That command does not exist.`);
		// 	break;
		default:
			twitchChat(`That command does not exist.`);
	}
});

function extractTeam(linkString) {
	const jsonLink = linkString + `/json`;
	// const response = await Fetch(jsonLink);
	// let pasteData = await response.text();
	let data;
	try {
		 data = JSON.parse(pasteData);
	} catch (e) {
		console.log(e);
		twitchChat(`Link does not have a team.`);
		team = null;
		return;
	}

	team = Teams.pack(Teams.import(data.paste));
	pokepaste = linkString;
}

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
