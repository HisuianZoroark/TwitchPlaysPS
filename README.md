# TwitchPlaysPS
This is a Twitch Bot with a PS client that allows you to cast votes to make a bot perform actions similarly to Twitch Plays Pokemon. Currently only supports most current generation singles formats. Does not yet support Doubles, Mega Evolution, Z-Crystals, picking more than 1 pokemon in team preview, etc.

## Installation
You will need:
* Node.js (v16.0.0 or higher)
* A Pokemon Showdown account for the bot
* A Twitch account for the bot and its respective OAuth access token

Make a file called config.js with the contents from config-example.js and put in the respective details (you are on your own with getting the Twitch OAuth token).

The streamer by default should have full administrative access, but if you are not the streamer make sure to add your twitch username to sysops in the config.js file

run `npm install`

run `node bot`

**It is highly recommended to check the disable animations setting on Pokemon Showdown, as bots don't watch animations.**

## Settings

### Prefix
Prefix for the bot.

### Vote Duration
How long a typical vote should last, in seconds.

### Inactivity Floor
If you reach this many seconds on timer, then the bot will immediately call the vote and make a move.

### Latency Buffer
Adds some time (in seconds) before a vote starts, this could be useful if your stream has some lag you need to account for.

### First Turn Bonus Time
Adds time (in seconds) to either team preview or the first turn of a match.

### Display Valid Options
Displays valid options to vote from in chat, can be very spammy.

## Commands

### vote move [move name or slot number] (Aliases: `move` or `m`)
Casts a vote for using a move. Can use a move and terastallize by adding either ` tera` or ` t` at the end.

### vote switch [pokemon name or slot number] (Aliases: `switch` or `s`)
Casts a vote for switching to a pokemon.

### team (Aliases: `t`)
Displays the team used for the ladder session, or the current team in a Random Battle.

### startladder [tier, pokepaste (optional)]
Starts laddering in a tier with a pokepaste. you do not need a team for random formats.

### endladder
Stops laddering.

### kill
Forces the bot offline

## Credits
HiZo (HisuianZoroark) - Maintainer and Lead Developer
