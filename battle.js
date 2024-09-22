export class Battle {
	room;
	tally;
	votecmds;
	acceptingVotes;
	constructor(room) {
		this.room = room;
		this.tally = {};
		this.votecmds = {};
		this.acceptingVotes = false;
		this.timeout = 60;
	}
	function genOptions(requestState) {
		this.votecmds = {};
		let request = JSON.parse(requestState);
		if (request.active && !request.forceSwitch) {
			for (x = 0; x < request.active.moves.length; x++) {
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
			for (x = 0; x < request.side.pokemon.length; x++) {
				if (request.active && !request.teamPreview) continue;
				this.votecmds[`switch ${x + 1}`] = `/${keyword} ${x}`;
				// this.votecmds[`switch ${request.active.moves[x].move}`] = `/${keyword} ${x}`;
			}
		}
	}
	function startVote() {
		this.acceptingVotes = true;
		this.tally = {};
		return new Promise(resolve => setTimeout(endVote(), this.timeout * 1000));
	}
	async function submitVote(username, vote) {
		let sanitizedvote = vote.toLowerCase().trim();
		let realvote = this.votecmds[sanitizedvote] || null;
		if (!realvote || !this.acceptingVotes) {
			Twitch.say(channel, `@${username} your vote was not accepted.`);
			return;
		}
		this.tally[username] = realvote;
	}
	function endVote() {
		this.acceptingVotes = false;
		let votes = Object.values(this.tally);
		findWinner(votes);
	}
	async function findWinner(arr) {
		const count = {};

		// Count occurrences of each value
		arr.forEach(value => {
			count[value] = (count[value] || 0) + 1;
		});

		let maxCount = 0;
		let mostFrequentValue = null;

		// Find the value with the most duplicates
		for (const [key, value] of Object.entries(count)) {
			if (value > maxCount) {
				maxCount = value;
				mostFrequentValue = key;
			}
		}

		return mostFrequentValue;
	}
}
