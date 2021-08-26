cube = new ERNO.Cube();

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

function hidePresentation() {
	document.getElementById('presentation').classList.add('hidden')	
}

function onLoad() {
	document.getElementById("cube").appendChild(cube.domElement);
	const socket = io("http://localhost:5000/frontend");

	cube.mouseInteraction.addEventListener('click', (evt) => {
		evt.cubelet.toggleColors();
		var qcode = evt.cubelet.getColorsAsQuestionCode();
		socket.emit("get_question", qcode);
	})

	socket.on("connect", () => {
		console.log("Connected to server as frontend");
	});

	socket.on('pounce', (data) => {
		console.log(data);
	});

	socket.on('question', (data) => {
		const question = JSON.parse(data);
		if (!question.attempted) {
			// display question on frontend
			document.getElementById('question').innerHTML = marked(question.question)
			document.getElementById('presentation').classList.remove('hidden')
		}
	});

	// TODO:
	// - timer
	// - auto pounce open/close based on timer
	// - pounce registration on css based on timer
	// - register question attempts on server
}