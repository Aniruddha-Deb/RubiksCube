cube = new ERNO.Cube();

function onLoad() {
	document.getElementById("cube").appendChild(cube.domElement);

	cube.mouseInteraction.addEventListener('click', (evt) => {
		evt.cubelet.toggleColors();
	})

	// connect to 
}