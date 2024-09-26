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
		this.timeout = 15;
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
			for (let x = 0; x < request.side.pokemon.length; x++) {
				if (request.active && !request.teamPreview && x <= 0) continue;
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
		let cmdArray = [];
		this.votecmds.forEach((value, key) => {
			if (!key.match(/\s[\d]+(\stera)?$/)) cmdArray.push(key);
		});
		this.acceptingVotes = true;
		twitchChat(`Starting vote! Use ${Config.Twitch.prefix}vote to vote!`);
		twitchChat(`Valid vote options: ${cmdArray.join(', ')}`);
		twitchChat(`(You can also use the move or pokemon slot number instead)`);
		this.endVoting = setTimeout(() => this.endVote(), this.timeout * 1000);
	}
	endVote() {
		this.acceptingVotes = false;
		twitchChat(`Ending vote...`);
		let winner = '/choose default';
		if (this.tally.size > 0) {
			let pool = new Map();
			this.tally.forEach((val, key) => {
				let cmd = val;
				let numVotes = pool.get(cmd) || 0;
				pool.set(cmd, (numVotes + 1));
			});
			let winningValue = 0;
			for (let [key, value] of pool) {
				if (value > winningValue) winner = key;
			}
		} else {

		}
		console.log(winner);
		makeDecision(winner, this.room);
	}
	async submitVote(username, vote) {
		console.log(vote);
		let sanitizedvote = vote.toLowerCase().trim();
		let realvote = this.votecmds.get(sanitizedvote) || null;
		console.log(this.votecmds.get(sanitizedvote));
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
	setTeam(link) {
		this.team = link;
	}
	getTeam() {
		return this.team;
	}
}
module.exports = Battle;
