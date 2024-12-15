// Welcome to my personal hell. I'm sorry
// Will elaborate on code with comments later

class Battle {
	room;
	tally;
	votecmds;
	acceptingVotes;
	constructor(room, team) {
		this.room = room;
		this.team = team;
		this.tally = new Map();
		this.votecmds = new Map();
		this.acceptingVotes = false;
		this.firstTurnBonus = true;
	}
	genOptions(requestState) {
		this.votecmds.clear();
		let request = JSON.parse(requestState);
		if (request.active && !request.forceSwitch) {
			for (let y = 0; y < request.active.length; y++) {
				for (let x = 0; x < request.active[y].moves.length; x++) {
					if (request.active[y].moves[x].disabled) continue;
					let move = request.active[y].moves[x].move;
					this.votecmds.set(`move ${x + 1}`, `/move ${x + 1}`);
					if (this.votecmds.get(`move ${move.toLowerCase()}`)) {
						for (let dupeCount = 1; dupeCount <= 24; dupeCount++) {
							if (this.votecmds.get(`move ${move.toLowerCase()}${dupeCount}`)) continue;
							this.votecmds.set(`move ${move.toLowerCase()}${dupeCount}`, `/move ${x + 1}`);
							break;
						}
					} else {
						this.votecmds.set(`move ${move.toLowerCase()}`, `/move ${x + 1}`);
					}
					if (request.active[y].canTerastallize) {
						this.votecmds.set(`move ${x + 1} tera`, `/move ${x + 1} terastallize`);
						if (this.votecmds.get(`move ${move.toLowerCase()} tera`)) {
							for (let dupeCount = 1; dupeCount <= 24; dupeCount++) {
								if (this.votecmds.get(`move ${move.toLowerCase()}${dupeCount} tera`)) continue;
								this.votecmds.set(`move ${move.toLowerCase()}${dupeCount} tera`, `/move ${x + 1} terastallize`);
								break;
							}
						} else {
							this.votecmds.set(`move ${move.toLowerCase()} tera`, `/move ${x + 1} terastallize`);
						}
					}
				}
			}
		}
		if (!request.active || !request.active.trapped) {
			let keyword = 'switch';
			if (request.teamPreview) keyword = 'team';
			let isReviving = false;
			for (let x = 0; x < request.side.pokemon.length; x++) {
				if (request.side.pokemon[x].reviving) isReviving = true;
				if (request.side.pokemon[x].active && !request.teamPreview) continue;
				if (isReviving) {
					if (request.side.pokemon[x].condition !== '0 fnt') continue;
				} else {
					if (request.side.pokemon[x].condition === '0 fnt') continue;
				}
				this.votecmds.set(`switch ${x + 1}`, `/${keyword} ${x + 1}`);
				let pokemon = request.side.pokemon[x].details.split(',')[0];
				// this.votecmds[`switch ${pokemon.toLowerCase()}`] = `/${keyword} ${x + 1}`;
				if (this.votecmds.get(`switch ${pokemon.toLowerCase()}`)) {
					for (let dupeCount = 1; dupeCount <= 24; dupeCount++) {
						if (this.votecmds.get(`switch ${pokemon.toLowerCase()}${dupeCount}`)) continue;
						this.votecmds.set(`switch ${pokemon.toLowerCase()}${dupeCount}`, `/${keyword} ${x + 1}`);
						break;
					}
				} else {
					this.votecmds.set(`switch ${pokemon.toLowerCase()}`, `/${keyword} ${x + 1}`);
				}
			}
		}
	}
	startVote() {
		this.tally.clear();
		let moveArray = [];
		let switchArray = [];
		let canGimmick = false;
		this.votecmds.forEach((value, key) => {
			if (!key.match(/\s[\d]+(\stera)?$/)) {
				if (key.startsWith('move ')) {
					if (key.endsWith(' tera')) {
						canGimmick = 'tera';
					} else {
						moveArray.push(key.replace('move ', ''));
					}
				} else if (key.startsWith('switch ')) {
					switchArray.push(key.replace('switch ', ''))
				}
			}
		});
		twitchChat(`Starting vote!`);
		if (Config.Settings.displayvalidoptions) {
			if (moveArray.length > 0) {
				twitchChat(`Use ${Config.Settings.prefix}move or ${Config.Settings.prefix}m to use a move. Valid moves: ${moveArray.join(', ')}`);
				if (canGimmick === 'tera') {
					twitchChat(`You can add tera or t (e.g. ${Config.Settings.prefix}move ${moveArray[0]} tera) to any move command to terastallize.`);
				}
			}
			if (switchArray.length > 0) {
				twitchChat(`Use ${Config.Settings.prefix}switch or ${Config.Settings.prefix}s make a switch. Valid switches: ${switchArray.join(', ')}`);
			}
		} else {
			twitchChat(`Use ${Config.Settings.prefix}move or ${Config.Settings.prefix}m to use a move. Use ${Config.Settings.prefix}switch or ${Config.Settings.prefix}s make a switch. You can add tera or t to any move command to terastallize.`);
		}
		twitchChat(`You can also use the move or pokemon slot number instead (e.g. ${Config.Settings.prefix}move 1 or ${Config.Settings.prefix}switch 1).`);
		this.acceptingVotes = true;
		let timeout = Config.Settings.voteduration;
		if (this.firstTurnBonus) {
			timeout += Config.Settings.firstturnbonustime;
			this.firstTurnBonus = false;
		}
		this.endVoting = setTimeout(() => this.endVote(), timeout * 1000);
	}
	endVote() {
		this.acceptingVotes = false;
		twitchChat(`Ending vote...`);
		let winner = [];
		if (this.tally.size > 0) {
			let pool = new Map();
			this.tally.forEach((val, key) => {
				let cmd = val;
				let numVotes = pool.get(cmd) || 0;
				pool.set(cmd, (numVotes + 1));
			});
			let winningValue = -1;
			for (let [key, value] of pool) {
				if (value >= winningValue) {
					if (value === winningValue) {
						winner.push(key);
					} else {
						winner = [key];
					}
				}
			}
		}
		let winningcmd = '/choose default';
		if (winner.length > 0) winningcmd = winner[Math.floor(Math.random() * winner.length)];
		// console.log(winningcmd);
		makeDecision(winningcmd, this.room);
	}
	async submitVote(username, vote) {
		// console.log(vote);
		let sanitizedvote = vote.toLowerCase().trim().replace(/\s{2,}/g, ' ');
		if (sanitizedvote.includes(',')) {
			sanitizedvote = sanitizedvote.replace(',', '');
		}
		if (sanitizedvote.endsWith(' t')) {
			sanitizedvote = sanitizedvote + 'era';
		}
		let realvote = this.votecmds.get(sanitizedvote) || null;
		// console.log(this.votecmds.get(sanitizedvote));
		if (!realvote || !this.acceptingVotes) {
			twitchChat(`@${username} your vote was not accepted.`);
			return;
		}
		this.tally.set(username, realvote);
	}
	leave() {
		makeDecision('/part', this.room);
		clearTimeout(this.endVoting);
	}
	earlyEnd() {
		if (!this.acceptingVotes) return;
		if (this.tally.size <= 0) return;
		clearTimeout(this.endVoting);
		this.endVote();
	}
	setTeam(packedTeam) {
		this.team = packedTeam;
	}
	getTeam() {
		return this.team;
	}
	waiting(request) {
		return !!JSON.parse(request).wait;
	}
}
module.exports = Battle;
