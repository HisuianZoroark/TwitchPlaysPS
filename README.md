# TwitchPlaysPS
This is a Twitch Bot with a PS client that allows you to cast votes to make a bot perform actions similarly to Twitch Plays Pokemon. It is still very new and barely holds itself together, but hey it works.

# Installation
You will need:
* Node.js
* A Pokemon Showdown account for the bot
* A Twitch account for the bot and its respective OAuth access token

Make a file called config.js with the contents from config-example.js and put in the respective details.

run `npm install`

run `node bot`

# Commands

### vote move [move name or slot number]

casts a vote for using a move

### vote move [move name or slot number] tera

casts a vote for using a move while terastallizing

### vote switch [pokemon name or slot number]

casts a vote for switching to a pokemon.

### startladder [tier, pokepaste (optional)]

starts laddering in a tier with a pokepaste. you do not need a team for random formats.

### endladder

stops laddering.
