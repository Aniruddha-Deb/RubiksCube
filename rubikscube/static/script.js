cube = new ERNO.Cube();
/*
class Quiz {

	constructor(num_teams) {
		this.num_teams = num_teams;
		this.teams = [];
		this.pounce_open = false;

		for (var i = 0; i < num_teams; i++) {
			this.teams.push(Team(i+1));
		}
	}

}

class Team {

	constructor(tno) {
		this.tno = tno;
		this.score = 0;
		this.pounced = false;
		this.bounced = false;
	}

}

class SocketEventHandler {

}
*/
function onLoad() {
	document.getElementById("cube").appendChild(cube.domElement);

	cube.mouseInteraction.addEventListener('click', (evt) => {
		evt.cubelet.toggleColors();
	})

	/*
	// connect to server
	const socket = io("http://localhost:5000/frontend");
	socket.on("connect", () => {
		console.log("Connected to server as frontend");
	});

	socket.on('pounce', (data) => {
		console.log(data);
	});*/
}