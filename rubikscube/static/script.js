cube = new ERNO.Cube();
var promoCube = new ERNO.Cube();

let rules = `
Rules:
	
1. Each color corresponds to a theme: Biz, Science, Tech, Engineering, Math or Software. You would need to derive the theme yourself, as QM's would not reveal the theme.
2. Depending on the number of colors, the question mapped to that cubelet would satisfy all the themes specified: a cubelet with one color would satisfy one theme (a face), a cubelet with two colors would satisfy two (an edge), and a cubelet with three colors would satisfy three (a corner).
3. All questions would have the same scoring pattern (+10/-5 pounce, +10 bounce) unless specified. Part pounce is not accepted, unless specified.
4. Each team gets to pick a question whenever it's their turn, according to standard pounce/bounce rules. Pounce remains open for a minute and is controlled by a timer, after which pounce is closed and bounce commences.
5. **Please only use the bot to pounce**. Pounces which tag Quizmaster, or any other pounces, will not be accepted.
6. Pounces are live, and would show up immediately on the screen. The pounce window notification would also show on the screen, indicating if the pounce window is open or not.
7. Erno would mark your pounces with a ✅ if they're accepted, or with a ❌ otherwise (if you pounce outside the window).
8. *Blocking*: if a team chooses to block, they will have to pounce, irrespective of whether they're doing the question on bounce or not. If even one team blocks, then no further hints are given.
9. On bounce, the last team to give all correct answers will get full points, and the question would terminate. Part points would be given to the first team to get that part right (even if no team answers all parts correctly).

If this seems complicated, it will all become clear after the test pounce round. Please keep your cameras on, and no googling. Good luck and have fun!
`

class Quiz {

	constructor(num_teams) {
		this.scoreboard = document.getElementById("scoreboard");
		this.timer = new Timer();
		this.teams = {};
		this.num_teams = num_teams;
		this.populate_scorecards();
		// forcing redraw
		window.dispatchEvent(new Event('resize'));

		this.curr_q_code = null;
		this.curr_q = null;
		this.curr_q_ans = null;

		this.showing_q = false;
		this.showing_a = false;
		this.pounce_open = false;
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
			this.teams[i] = new Team(i,document.getElementById(`team-${i}`),document.getElementById(`team-score-${i}`))
			this.teams[i].scorecard_score.onclick = function() {
				update_score(this,5);
			}
			this.teams[i].scorecard_score.oncontextmenu = function() {
				update_score(this,-5);
				return false;
			}
		}

	}

	pounced(tno) {
		if (this.pounce_open) {
			this.teams[tno].set_pounced();
		}
	}

	reset_pounce(tno) {
		if (!this.pounce_open) {
			this.teams[tno].reset_pounced();			
		}
	}

	open_pounce() {
		this.pounce_open = true;
		socket.emit("pounce_open");
		for (let team in quiz.teams) {
			quiz.teams[team].set_pounce_open();
		}

		document.getElementById('pounce-notif').classList.remove('hidden');
	}

	close_pounce() {
		this.pounce_open = false;
		socket.emit("pounce_close");
		for (let team in quiz.teams) {
			quiz.teams[team].reset_pounce_open();
		}
		document.getElementById('pounce-notif').classList.add('hidden');	
	}

	display_question(question) {
		if (!this.showing_q && !this.showing_a) {
			this.curr_q = question.question;
			this.curr_q_ans = question.answer;
			this.display_curr_question();
			document.getElementById('presentation').classList.remove('hidden');

			// set colors
			var color_1 = document.getElementById('color-1');
			var color_2 = document.getElementById('color-2');
			var color_3 = document.getElementById('color-3');
			color_1.classList.add(this.curr_q_code[0]);
			if (this.curr_q_code.length > 1) {
				color_2.classList.add(this.curr_q_code[1])
				if (this.curr_q_code.length > 2) {
					color_3.classList.add(this.curr_q_code[2]);
				}
				else {
					color_3.classList.add('hidden');
				}
			}
			else {
				color_2.classList.add('hidden');
			}

			this.open_pounce();
			this.timer.start_new_timer(60,null,this.close_pounce.bind(this));
		}
	}

	display_curr_question() {
		this.showing_q = true;
		this.showing_a = false;
		document.getElementById('prev-button').classList.add("hidden");
		document.getElementById('question').innerHTML = marked(this.curr_q);
	}

	display_question_answer() {
		if (this.pounce_open) {
			var r = confirm("Pounce will be closed. Continue without bounce?");
			if (r) {
				this.close_pounce();
				this.display_question_answer();
			}
		}
		else {
			this.display_curr_question_answer();
			this.timer.reset_timer();
		}
	}

	display_curr_question_answer() {
		this.showing_q = false;
		this.showing_a = true;
		document.getElementById('question').innerHTML = marked(this.curr_q_ans);
		document.getElementById('prev-button').classList.remove("hidden");
	}

	return_to_cube() {
		this.showing_a = false;
		var color_1 = document.getElementById('color-1');
		var color_2 = document.getElementById('color-2');
		var color_3 = document.getElementById('color-3');
		color_1.classList.remove(this.curr_q_code[0]);
		if (this.curr_q_code.length > 1) {
			color_2.classList.remove(this.curr_q_code[1])
			if (this.curr_q_code.length > 2) {
				color_3.classList.remove(this.curr_q_code[2]);
			}
			else {
				color_3.classList.remove('hidden');
			}
		}
		else {
			color_2.classList.remove('hidden');
		}
		document.getElementById('presentation').classList.add('hidden');
		document.getElementById('prev-button').classList.add("hidden");
		socket.emit("question_attempted", this.curr_q_code);
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
		this.reset_pounced();
		this.reset_pounce_open();
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

class Timer {

	constructor() {
		this.curr_time = 0; // time in seconds
		this.ticking = false;
		this.timer_div = document.getElementById('timer');

		this.timer_loop = null;
		this.tick_callback = null;
		this.end_callback = null;
	}

	tick() {
		if (this.ticking && this.curr_time > 0) {
			console.log("Tick update");
			this.timer_div.innerHTML = 
					Math.floor(this.curr_time/60).toString().padStart(2,'0') 
					+ ":" 
					+ (this.curr_time%60).toString().padStart(2,'0');
			this.curr_time -= 1;
			typeof this.tick_callback === 'function' && this.tick_callback();
		}
		else if (this.curr_time === 0) {
			console.log("Tick shutdown");
			this.ticking = false;
			this.timer_div.innerHTML = "00:00";
			clearInterval(this.timer_loop);
			typeof this.end_callback === 'function' && this.end_callback();
		}
	}

	start_new_timer(duration, tick_callback, end_callback) {
		this.curr_time = duration;
		this.tick_callback = tick_callback;
		this.end_callback = end_callback;
		this.ticking = true;
		this.timer_loop = setInterval(this.tick.bind(this), 1000);
		this.timer_div.classList.remove('timer-inactive');
		this.tick();
	}

	pause_play_timer() {
		if (this.ticking) {
			this.timer_div.classList.add('timer-paused');
		}
		else {
			this.timer_div.classList.remove('timer-paused');
		}
		this.ticking = !this.ticking;
	}

	reset_timer() {
		clearInterval(this.timer_loop);
		this.curr_time = 0;
		this.timer_div.innerHTML = "--:--";
		this.timer_div.classList.add('timer-inactive');
		this.timer_div.classList.remove('timer-paused');
	}
}

function update_score(element,incr) {
	console.log(element.id);
	var tno = parseInt(element.id.split("-")[2]);
	console.log(tno);
	var team = quiz.teams[tno];
	if (team.pounced) {
		team.reset_pounced(tno);
	}
	team.increment_score(incr);
}

function timer_click() {
	if (quiz.pounce_open && quiz.showing_q) {
		quiz.timer.pause_play_timer();
	}
	else if (!quiz.showing_q && !quiz.pounce_open) {
		quiz.open_pounce();
	}
}

function pounce_notif_click() {
	if (quiz.pounce_open) {
		quiz.close_pounce();
		quiz.timer.reset_timer();
	}
}

function next() {
	if (quiz.showing_q) {
		quiz.display_question_answer();
	}
	else if (quiz.showing_a) {
		quiz.return_to_cube();
	}
}

function prev() {
	if (quiz.showing_a) {
		quiz.display_curr_question();
	}
}

var socket = null;
var quiz = null;
var showing_instructions = true;

function onLoad() {
	document.getElementById("rules").innerHTML = marked(rules);
	document.getElementById("cube").appendChild(cube.domElement);
	document.getElementById("promo-cube").appendChild(promoCube.domElement);

	socket = io("http://localhost:5000/frontend");

	var shiftDown = false;
	document.addEventListener('keydown', (e) => {
		if (e.shiftKey) {
			shiftDown = true;
		}
	});
	document.addEventListener('keyup', (e) => {
		if (shiftDown = true) {
			shiftDown = false;
		}
		var charCode = e.keyCode || e.which;
    	if (charCode === 190) {
    		if (showing_instructions) {
	    		showing_instructions = false;
	    		document.getElementById("intro").classList.add("hidden");
	    	}
	    	else {
	    		showing_instructions = true;
	    		document.getElementById("intro").classList.remove("hidden");	    		
	    	}
    	}
    	
	});

	cube.mouseInteraction.addEventListener('click', (evt) => {
		var qcode = evt.cubelet.getColorsAsQuestionCode();
		if (shiftDown) {
			evt.cubelet.showColors();
			socket.emit("reload_question", qcode);
			console.log("Reloading question");
		}
		else {
			evt.cubelet.hideColors();
			quiz.curr_q_code = qcode;
			socket.emit("get_question", qcode);
		}
	});

	socket.on("connect", () => {
		console.log("Connected to server as frontend");
	});

	socket.on("num_teams", (data) => {
		quiz = new Quiz(parseInt(data));
		console.log("Created quiz");
	})

	socket.on('pounce', (data) => {
		// TODO add pounced class to team indicator
		var tno = parseInt(data);
		this.quiz.pounced(tno);
	});

	socket.on('question', (data) => {
		const question = JSON.parse(data);
		if (!question.attempted) {
			// display question on frontend
			quiz.display_question(question);
		}
	});
}