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
		this.timeout = 10;
	}
	genOptions(requestState) {
		this.votecmds = {};
		let request = JSON.parse(requestState);
		if (request.active && !request.forceSwitch) {
			for (let x = 0; x < request.active.moves.length; x++) {
				this.votecmds[`move ${x + 1}`] = `/move ${x}`;
				this.votecmds[`move ${request.active.moves[x].move}`] = `/move ${x}`;
				if (request.active.canTerrastallize) {
					this.votecmds[`move ${x + 1} tera`] = `/move ${x} terastallize`;
					this.votecmds[`move ${request.active.moves[x].move} tera`] = `/move ${x} terastallize`;
				}
			}
		}
		if (!request.active || !request.active.trapped) {
			let keyword = 'switch';
			if (request.teamPreview) keyword = 'choose';
			for (let x = 0; x < request.side.pokemon.length; x++) {
				if (request.active && !request.teamPreview) continue;
				this.votecmds[`switch ${x + 1}`] = `/${keyword} ${x}`;
				// this.votecmds[`switch ${request.active.moves[x].move}`] = `/${keyword} ${x}`;
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
		let votes = this.tally.values();
		console.log(votes);
		let winner = this.findWinner(votes);
		if (!winner) {
			winner = 'no winner';
		}
		console.log(winner);
		makeDecision(winner, this.room);
	}
	async submitVote(username, vote) {
		let sanitizedvote = vote.toLowerCase().trim();
		let realvote = this.votecmds[sanitizedvote] || null;
		if (!realvote || !this.acceptingVotes) {
			twitchChat(`@${username} your vote was not accepted.`);
			return;
		}
		this.tally.set(username, realvote);
	}
}
module.exports = Battle;
