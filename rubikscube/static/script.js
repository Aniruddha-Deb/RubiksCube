cube = new ERNO.Cube();

function onLoad() {
	document.getElementById("cube").appendChild(cube.domElement);

	cube.mouseInteraction.addEventListener('click', (evt) => {
		evt.cubelet.toggleColors();
	})

	// connect to server
	const socket = io("http://localhost:5000/frontend");
	socket.on("connect", () => {
		console.log("Connected to server as frontend");
	});

	socket.on('pounce', (data) => {
		console.log(data);
	})
}