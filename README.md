# TwitchPlaysPS
This is a Twitch Bot with a PS client that allows you to cast votes to make a bot perform actions similarly to Twitch Plays Pokemon. It is still very new and barely holds itself together, but hey it works.

Currently only supports most current generation singles formats. Does not yet support Doubles, Mega Evolution, Z-Crystals, picking more than 1 pokemon in team preview, etc.

## Installation
You will need:
* Node.js (v14.0.0 or higher)
* A Pokemon Showdown account for the bot
* A Twitch account for the bot and its respective OAuth access token

Make a file called config.js with the contents from config-example.js and put in the respective details (you are on your own with getting the Twitch OAuth token).

The streamer by default should have full administrative access, but if you are not the streamer make sure to add your twitch username to sysops in the config.js file

run `npm install`

run `node bot`

## Commands

### vote move [move name or slot number]
Casts a vote for using a move
### move [move name or slot number]
Casts a vote for using a move

### vote move [move name or slot number] tera
Casts a vote for using a move while terastallizing
### move [move name or slot number] tera
Casts a vote for using a move while terastallizing

### vote switch [pokemon name or slot number]
Casts a vote for switching to a pokemon.
### switch [pokemon name or slot number]
Casts a vote for switching to a pokemon.

### team
Displays the team used for the ladder session.

### startladder [tier, pokepaste (optional)]
Starts laddering in a tier with a pokepaste. you do not need a team for random formats.

### endladder
Stops laddering.

### kill

Forces the bot offline

## Credits
HiZo (HisuianZoroark) - Maintainer and Lead Developer
