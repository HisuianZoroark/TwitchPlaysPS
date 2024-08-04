const Tmi = require('tmi.js');
const WebSocket = require('ws');
const ReconnectingWebSocket = require('websocket-reconnect');
const fs = require('fs');
const fetch = require('node-fetch');
global.Config = require('./config/config.js');

// Connect to PS!
const PS = new ReconnectingWebSocket.WsReconnect({ reconnectDelay: 5000 });
PS.open('wss://sim3.psim.us/showdown/websocket');


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
	if (message.toLowerCase() === '!hello') {
		Twitch.say(channel, `@${tags.username}, heya!`);
	}
});

PS.on('open', function open(connection) {
	console.log('Connected to PS!');
});

PS.on('message', function message(data) {
	const bits = data.toString().split('|');
	if (bits[1] === 'challstr') {
		// console.log('received: %s', bits);
		PSlogin(bits);
	} else if (bits[1] === 'request') {
		room = bits[0];
		if (bits[2].length > 0) {
			reqData = JSON.parse(bits[2]);
			console.log(reqData);
		} else {
			reqData = false;
			room = false;
		}
	}
});

async function PSlogin(bits) {
	try {
		const body = `act=login&name=${Config.Showdown.username}&pass=${Config.Showdown.password}&challengekeyid=${bits[2]}&challenge=${bits[3]}`;
		const response = await fetch('https://play.pokemonshowdown.com/action.php', {
			method: 'post',
			body: body,
			headers: {"Content-Type": "application/x-www-form-urlencoded", "Content-Length": body.length},
		});
		let data = await response.text();
		if (data.charAt(0) === ']') {
			data = JSON.parse(data.substring(1));
			PS.send(`|/trn ${Config.Showdown.username},0,${data.assertion}`);
			PS.send(`|/avatar ${Config.Showdown.avatar}`);
			console.log(`Logged into PS! Username: ${Config.Showdown.username}`);
		} else {
			console.log(`There might be an error with the account you're trying to access, please try again.`);
			return;
		}
	} catch (e) {
		console.log(e);
		return;
	}
}
