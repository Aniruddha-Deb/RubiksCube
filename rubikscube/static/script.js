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
		this.teams = {};
		this.scorecards = {}; // TODO remove if not required
		this.num_teams = num_teams;
		this.populate_scorecards();
		// forcing redraw
		window.dispatchEvent(new Event('resize'));

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
			this.scorecards[i] = [document.getElementById(`team-score-${i}`), 0, document.getElementById(`team-${i}`)];
			this.scorecards[i][0].onclick = function() {
				update_score(this,5);
			}
			this.scorecards[i][0].oncontextmenu = function() {
				update_score(this,-5);
				return false;
			}

			this.teams[i] = new Team(i,document.getElementById(`team-${i}`),document.getElementById(`team-score-${i}`))
		}

	}

	pounced(tno) {
		this.teams[tno].set_pounced();
	}

	reset_pounce(tno) {
		this.teams[tno].reset_pounced();
	}
}

class Team {

	constructor(tno, scorecard_header, scorecard_score) {
		this.tno = tno;
		this.score = 0;
		this.pounced = false;
		this.pounce_open = false;
		this.bounced = false;

		this.scorecard_score = scorecard_score;
		this.scorecard_header = scorecard_header;
	}

	set_pounce_open() {
		this.pounce_open = true;
		this.scorecard_header.classList.add('scorecard-header-pounce-open');
		this.scorecard_score.classList.add('scorecard-score-pounce-open');
	}

	set_pounced() {
		this.pounced = true;
		this.scorecard_header.classList.add('scorecard-header-pounced');
		this.scorecard_score.classList.add('scorecard-score-pounced');
	}

	reset_pounced() {
		this.pounced = false;		
		this.scorecard_header.classList.remove('scorecard-header-pounced');
		this.scorecard_score.classList.remove('scorecard-score-pounced');		
	}

	reset_pounce_open() {
		this.pounce_open = false;
		this.scorecard_header.classList.remove('scorecard-header-pounce-open');
		this.scorecard_score.classList.remove('scorecard-score-pounce-open');		
	}

	reset() {
		reset_pounced();
		reset_pounce_open();
	}

	increment_score(val) {
		this.score += val;
		this.scorecard_score.innerText = this.score;
	}

	decrement_score(val) {
		this.score -= val;
		this.scorecard_score.innerText = this.score;
	}
}

class SocketEventHandler {

}

function hidePresentation() {
	document.getElementById('presentation').classList.add('hidden')
	close_pounce();
	socket.emit("question_attempted", curr_q);
}

function showAnswer() {
	console.log("TODO replace answers here");
}


function update_score(element,incr) {
	console.log(element.id);
	var tno = parseInt(element.id.split("-")[2]);
	console.log(tno);
	var team = this.scoreboard.teams[tno];
	if (team.pounced) {
		team.reset_pounced(tno);
	}
	team.increment_score(incr);
}

function open_pounce() {
	socket.emit("pounce_open");
	for (let team in scoreboard.teams) {
		scoreboard.teams[team].set_pounce_open();
	}

	document.getElementById('pounce-notif').classList.remove('hidden');
}

function close_pounce() {
	socket.emit("pounce_close");
	for (let team in scoreboard.teams) {
		scoreboard.teams[team].reset_pounce_open();
	}
	document.getElementById('pounce-notif').classList.add('hidden');	
}

var socket = null;
var scoreboard = null;
var curr_q = null;

function onLoad() {
	document.getElementById("cube").appendChild(cube.domElement);
	socket = io("http://localhost:5000/frontend");

	var shiftDown = false;
	document.addEventListener('keydown', (e) => {
		if (e.shiftKey) {
			shiftDown = true;
			console.log("Shift down");
		}
	});
	document.addEventListener('keyup', (e) => {
		if (shiftDown = true) {
			shiftDown = false;
			console.log("Shift up");
		}
	});

	cube.mouseInteraction.addEventListener('click', (evt) => {
		if (shiftDown) {
			evt.cubelet.showColors();
			var qcode = evt.cubelet.getColorsAsQuestionCode();
			socket.emit("reload_question", qcode);
			console.log("Reloading question");
		}
		else {
			evt.cubelet.hideColors();
			var qcode = evt.cubelet.getColorsAsQuestionCode();
			curr_q = qcode;
			socket.emit("get_question", qcode);
		}
	});

	socket.on("connect", () => {
		console.log("Connected to server as frontend");
	});

	socket.on("num_teams", (data) => {
		scoreboard = new Scoreboard(parseInt(data));
	})

	socket.on('pounce', (data) => {
		// TODO add pounced class to team indicator
		var tno = parseInt(data);
		this.scoreboard.pounced(tno);
	});

	socket.on('question', (data) => {
		const question = JSON.parse(data);
		if (!question.attempted) {
			// display question on frontend
			document.getElementById('question').innerHTML = marked(question.question)
			document.getElementById('presentation').classList.remove('hidden')

			open_pounce();
		}
	});
}