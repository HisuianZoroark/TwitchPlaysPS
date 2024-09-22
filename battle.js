export class Battle {
	room;
	request;
	tally;
	votecmds;
	constructor(room) {
		this.room = room;
		this.request = new Object();
		this.tally = new Object();
		this.votecmds = [];
	}
}
