class Battle {
	room;
	tally;
	votecmds;
	acceptingVotes;
	constructor(room) {
		this.room = room;
		this.tally = new Map();
		this.votecmds = {};
		this.acceptingVotes = false;
		this.timeout = 15;
	}
	genOptions(requestState) {
		this.votecmds = {};
		let request = JSON.parse(requestState);
		if (request.active && !request.forceSwitch) {
			for (let y = 0; y < request.active.length; y++) {
				for (let x = 0; x < request.active[y].moves.length; x++) {
					this.votecmds[`move ${x + 1}`] = `/move ${x + 1}`;
					this.votecmds[`move ${request.active[y].moves[x].move.toLowerCase()}`] = `/move ${x + 1}`;
					if (request.active[y].canTerastallize) {
						this.votecmds[`move ${x + 1} tera`] = `/move ${x + 1} terastallize`;
						let move = request.active[y].moves[x].move;
						this.votecmds[`move ${move.toLowerCase()} tera`] = `/move ${x + 1} terastallize`;
					}
				}
			}
		}
		if (!request.active || !request.active.trapped) {
			let keyword = 'switch';
			if (request.teamPreview) keyword = 'team';
			for (let x = 0; x < request.side.pokemon.length; x++) {
				if (request.active && !request.teamPreview && x <= 0) continue;
				this.votecmds[`switch ${x + 1}`] = `/${keyword} ${x + 1}`;
				let pokemon = request.side.pokemon[x].ident.substring(4);
				this.votecmds[`switch ${pokemon.toLowerCase()}`] = `/${keyword} ${x + 1}`;
			}
		}
	}
	startVote() {
		this.tally.clear();
		this.acceptingVotes = true;
		return new Promise(resolve => setTimeout(() => this.endVote(), this.timeout * 1000));
	}
	endVote() {
		this.acceptingVotes = false;
		let winner = 'no winner';
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
		let realvote = this.votecmds[sanitizedvote] || null;
		console.log(this.votecmds[sanitizedvote]);
		if (!realvote || !this.acceptingVotes) {
			twitchChat(`@${username} your vote was not accepted.`);
			return;
		}
		this.tally.set(username, realvote);
	}
}
module.exports = Battle;
