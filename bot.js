'use strict';
const Tmi = require('tmi.js');
const PSClient = require('ps-client');
const PokemonShowdown = require('pokemon-showdown');
const Fetch = require('node-fetch');
global.Config = require('./config/config.js');
const Battle = require('./battle.js');
const Dex = PokemonShowdown.Dex;
const Teams = PokemonShowdown.Teams;
let session;
let laddering = false;
let inBattle = false;
let format;
let team = null;
let pokepaste;

// Connect to PS!
const Ps = new PSClient.Client({
	username: Config.Showdown.username,
	password: Config.Showdown.password,
	avatar: Config.Showdown.avatar,
	debug: true,
});

Ps.connect();

// Ps.on('message', message => {
// 	if (message.isIntro) return;
// 	//console.log(Ps.rooms);
// 	if (message.content === '/challenge gen9randomdoublesbattle|gen9randomdoublesbattle|||') {
// 		message.reply('/utm null');
// 		message.reply('/accept');
// 	}
// 	console.log(message.content);
// });

Ps.on('popup', (room, message, isIntro) => {
	if (message.startsWith(`Your team was rejected for the following reasons:`)) {
		laddering = false;
		team = null;
		pokepaste = false;
		Ps.send('|/cancelsearch');
		twitchChat(`An error was encountered while attempting to ladder, please try another team.`);
	}
});

Ps.on('chatError', (room, message, isIntro) => {
	console.log(message);
});

Ps.on('inactive', (room, notif, isIntro) => {
	if (!session) return;
	if (!notif.startsWith(Config.Showdown.username)) return;
	let slicedMessage = notif.slice(Config.Showdown.username.length).trim().split(' ');
	let earlyEnd = 60;
	let timerIndex = 1;
	if (slicedMessage[0] === 'disconnected' || slicedMessage[0] === 'reconnected') timerIndex = 3;
	let inactiveTime = parseInt(slicedMessage[timerIndex]);
	if (inactiveTime <= earlyEnd) {
		session.earlyEnd();
	}
});
Ps.on('request', (room, request, isIntro) => {
	if (!session) {
		session = new Battle(room, team);
		inBattle = true;
	}
	if (request.length) {
		if (!session.getTeam()) {
			// todo: randbats
		}
		if (!session.waiting(request)) {
			session.genOptions(request);
			session.startVote();
		}
	}
});

Ps.on('win', (room, request, isIntro) => {
	session.leave();
	session = null;
	if (laddering) {
		Ps.send(`|/utm ${team}`);
		Ps.send(`|/search ${format}`);
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
	let args = message.slice(Config.Twitch.prefix.length).split(' ');
	let command = args.shift().toLowerCase();
	let content = args.join(' ');
	let isAdmin = [Config.Twitch.streamer].concat(Config.Twitch.sysops).includes(author);
	switch (command) {
		case 'v':
		case 'move':
		case 'switch':
		case 'vote':
			if (inBattle === false || !session) {
				twitchChat(`${author} we aren't in a battle yet!`);
				return;
			}
			if (command === 'move' || command === 'switch') {
				content = command.concat(' ') + content;
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
				pokepaste = null;
				laddering = true;
				Ps.send(`|/utm ${team}`);
				Ps.send(`|/search ${format}`);
				twitchChat(`Started laddering.`);
			} else {
				(async () => {
					let link = args[1].trim();
					if (link.match(/https:\/\/pokepast\.es\/(.*)$/)) {
						const jsonLink = link + `/json`;
						const response = await Fetch(jsonLink);
						let pasteData = await response.text();
						let data;
						try {
							 data = JSON.parse(pasteData);
							 team = Teams.pack(Teams.import(data.paste));
							 pokepaste = link;
						} catch (e) {
							console.log(e);
							twitchChat(`Link does not have a team.`);
							team = null;
							return;
						}
					}
					laddering = true;
					Ps.send(`|/utm ${team}`);
					Ps.send(`|/search ${format}`);
					twitchChat(`Started laddering.`);
				})();
			}
			break;
		case 'end':
		case 'stop':
		case 'endladder':
			if (!isAdmin) {
				twitchChat(`Access denied.`);
				return;
			}
			laddering = false;
			Ps.send('|/cancelsearch');
			twitchChat(`Stopped ladderisng.`);
			break;
		case 'kill':
			if (!isAdmin) {
				twitchChat(`Access denied.`);
				return;
			}
			process.exit();
			break;
		case 'team':
			if (!pokepaste) {
				twitchChat(`There is no team link or this is a Random Battle.`);
				return;
			}
			twitchChat(`Team link: ${pokepaste}`);
			break;
		case 'code':
		case 'git':
		case 'github':
			twitchChat(`We're open source, check us out: https://github.com/HisuianZoroark/TwitchPlaysPS`);
			break;
		case 'info':
		case 'help':
			twitchChat(`Command information: https://github.com/HisuianZoroark/TwitchPlaysPS#commands`);
			break;
		case 'pic':
		case 'partnersincrime':
			twitchChat(`Play Partners in Crime! https://spo.ink/svpartnersincrime`);
			break;
		case 'triples':
			twitchChat(`Play Triples! https://spo.ink/svtriples`);
			break;
		case 'hi':
			if (author !== 'hisuian_zoroark') return;
			twitchChat(`zo`);
			break;
		default:
			twitchChat(`That command does not exist.`);
	}
});

function makeDecision(message, room) {
	try {
		Ps.rooms.get(room).send(message);
	} catch (e) {
		console.log(e);
	}
}
global.makeDecision = makeDecision;

function twitchChat(message) {
	let channel = '#' + Config.Twitch.streamer;
	Twitch.say(channel, message);
}
global.twitchChat = twitchChat;
