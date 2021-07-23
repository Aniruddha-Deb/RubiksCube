var canvas = null;

function main() {
	console.log("loaded");
	canvas = new fabric.Canvas('c1', {
		backgroundColor : "#fff"
	});
	canvas.isDrawingMode = true;
	canvas.freeDrawingBrush.width = 5;
}

function clear_canvas() {
	canvas.clear();
	canvas.backgroundColor = "#fff"
	document.getElementById("answer").innerHTML = "="
}

function calculate() {
	var img = canvas.toDataURL()
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "api/get_answer", true); 
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	xhr.onreadystatechange = function() { 
		if (xhr.readyState == 4 && xhr.status == 200)
			document.getElementById("answer").innerHTML = "="+xhr.responseText
	}
	xhr.send("img="+encodeURIComponent(img.substr(22)));
}