cube = new ERNO.Cube();

function onLoad() {
	//cube.hideStickers()
	document.getElementById("cube").appendChild(cube.domElement);

	cube.mouseInteraction.addEventListener('click', (evt) => {
		evt.cubelet.toggleColors();
	})
}

/*
{
	cubeletColorMap: [

		//  Front slice

		[ N, N,  ,  , N,   ],    [ N, N,  ,  ,  ,   ],    [ N, N, N,  ,  ,   ],//   0,  1,  2
		[ N,  ,  ,  , N,   ],    [ N,  ,  ,  ,  ,   ],    [ N,  , N,  ,  ,   ],//   3,  4,  5
		[ N,  ,  , N, N,   ],    [ N,  ,  , N,  ,   ],    [ N,  , N, N,  ,   ],//   6,  7,  8


		//  Standing slice

		[  , N,  ,  , N,   ],    [  , N,  ,  ,  ,   ],    [  , N, N,  ,  ,   ],//   9, 10, 11
		[  ,  ,  ,  , N,   ],    [  ,  ,  ,  ,  ,   ],    [  ,  , N,  ,  ,   ],//  12, XX, 14
		[  ,  ,  , N, N,   ],    [  ,  ,  , N,  ,   ],    [  ,  , N, N,  ,   ],//  15, 16, 17


		//  Back slice

		[  , N,  ,  , N, N ],    [  , N,  ,  ,  , N ],    [  , N, N,  ,  , N ],//  18, 19, 20
		[  ,  ,  ,  , N, N ],    [  ,  ,  ,  ,  , N ],    [  ,  , N,  ,  , N ],//  21, 22, 23
		[  ,  ,  , N, N, N ],    [  ,  ,  , N,  , N ],    [  ,  , N, N,  , N ] //  24, 25, 26

	]
	}
*/