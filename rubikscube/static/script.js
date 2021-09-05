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

class Scoreboard {

	constructor(num_teams) {
		this.scoreboard = document.getElementById("scoreboard");
		this.scorecards = {};
		this.num_teams = num_teams;
		this.populate_scorecards();
	}

	populate_scorecards() {
		for (var i=1; i<=this.num_teams; i++) {
			var scorecard = 
			`<div class="scorecard col">
				<div class="scorecard-header" id='team-${i}'>Team ${i}</div>
				<div class="scorecard-score" id='team-score-${i}' tno='${i}'>0</div>
			</div>\n`;
			this.scoreboard.innerHTML += scorecard;
		}
		for (var i=1; i<=this.num_teams; i++) {
			this.scorecards[i] = [document.getElementById(`team-score-${i}`), 0];
			this.scorecards[i][0].onclick = function() {
				update_score(this,5);
			}
			this.scorecards[i][0].oncontextmenu = function() {
				update_score(this,-5);
				return false;
			}
		}
	}

	// TODO
	//pounced()

	//reset_pounce()


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
	socket.emit("pounce_close")
	socket.emit("question_attempted", curr_q);
}

function showAnswer() {
	console.log("TODO replace answers here");
}


function update_score(element,incr) {
	var tno = parseInt(element.id[element.id.size()-1]); // can't even tell you how hacky this is.
	console.log(tno);
	var team = this.scoreboard.scorecards[tno];
	team[0].innerText = team[1]+incr;
	team[1] += incr;
}

var socket = null;
var scoreboard = null;
var curr_q = null;

function onLoad() {
	document.getElementById("cube").appendChild(cube.domElement);
	socket = io("http://localhost:5000/frontend");

	cube.mouseInteraction.addEventListener('click', (evt) => {
		evt.cubelet.showColors();
		var qcode = evt.cubelet.getColorsAsQuestionCode();
		curr_q = qcode;
		socket.emit("get_question", qcode);
	});

	socket.on("connect", () => {
		console.log("Connected to server as frontend");
	});

	socket.on("num_teams", (data) => {
		scoreboard = new Scoreboard(parseInt(data));
	})

	socket.on('pounce', (data) => {
		var tno = parseInt(data);
		console.log(tno);
	});

	socket.on('question', (data) => {
		const question = JSON.parse(data);
		if (!question.attempted) {
			// display question on frontend
			document.getElementById('question').innerHTML = marked(question.question)
			document.getElementById('presentation').classList.remove('hidden')
			socket.emit("pounce_open");
		}
	});
}