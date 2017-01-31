//TODO: Bug da comida escondida.
//TODO: Bug de perder ao apanhar a comida do lado direito encostado à borda.

var options = {};
(function(op){
	
	'use strict';

	// options = options || {};
	// null is equals to undefined
	if ( op == null || isEmpty(op) ) {
		op = {
			snakeBobyColor: "Green",
			snakeHeadColor: "DarkGreen",
			snakeFoodColor: "LightGreen",
			snakeDefaultSize: 5,
			canvasType: "Full", // Square
			debug: false,
			refreshTime: 200 // Insert a value in milliseconds.
		};
	}

	/**
	 * The status of the game.
	 *
	 * @type string (Ready, Loser, Paused, Running)
	 */
	var gameStatus = "Ready";


	/**
	 * The snake is build by squares. This is the value of the square side.
	 *
	 * @type number
	 */
	var snakeSize = 0;


	/**
	 * The size of the game painel. This is meter in snake size. Canvas size in pixeis is equals to
	 * matrix size times snake size.
	 *
	 * @type Object
	 */
	var matrixSize = {};


	/**
	 * This is a HTML Element where we will play.
	 *
	 * @type Element
	 */
	var canvas = "";


	/**
	 * 2D context where we have the canvas.
	 *
	 * @type Object
	 */
	var context = "";
	var timer = 0;
	var points = [];
	var key = 100;
	var lastKey = 100;
	var emptyMatrixPoints = [];
	var auxEmptyMatrixPoints = [];
	var food = {};
	var foodSize = 1;
	var theSnakeGetsFatter = false;
	var placard = "";
	var mousePoint = {};

	window.onload = function(){
		canvas = document.getElementById("board");
		placard = document.getElementById("score");
		
		switch(op.canvasType){
			case "Full": {drawFullCanvas();}break;
			default: {drawSquareCanvas();}break;
		}
		
		addMouseFeature();
		
		for (var i = 0; i < op.snakeDefaultSize; i++) {
			points.push({
				x: Math.floor( matrixSize.x / 2 ) * snakeSize - ( i * snakeSize ), 
				y: Math.floor( matrixSize.y / 2 ) * snakeSize
			});
		}

		placardUpdate();
		getEmptyMatrixPoints();
		getMoreFoodToTheSnake();
		drawTheFood();
		drawSnake();

		//timer = setInterval(drawSnake, op.refreshTime);
	};	

	
	// We are going to use this function to calculate a empty point to put the snake's food.
	// We cant not put the food at the points filled by the snake. sShe can bit us :).
	function getEmptyMatrixPoints(){
		// Based on matrix size we are going to generate an array with all empty points.
		// Thus we can easly select a point to draw the food to the snake.
		// We start to think that all points are empty. But is not true, at this point we already have
		// created the snake, and the snake's points are not empty.
		for (var j = 0; j < matrixSize.y; j++) {
			for (var i = 0; i < matrixSize.x; i++) {
				emptyMatrixPoints.push({ 
									x: (i * snakeSize), 
									y: (j * snakeSize)
								});
			}
		}

		// We use this routine to remove the snake's points from the matrix. How this points are fill
		// by the snake they are not empty. Make sense :)
		for (var k = 0; k < points.length; k++) {
			// We use an array to manage the empty points, so next formula transform a matrix point 
			// in a array point. Thus we can remove the fill points from de enpty matrix points.
			var index = (((points[k].y / snakeSize) * matrixSize.x) + (points[k].x / snakeSize));
			auxEmptyMatrixPoints.splice(index,1);
		}
		log(emptyMatrixPoints);
	}

	function removeEmptyMatrixPoints(point) {
		var index = (((point.y / snakeSize) * matrixSize.x) + (point.x / snakeSize))
		auxEmptyMatrixPoints.splice(index,1);
	}

	function addEmptyMatrixPoints(point) {
		var index = (((point.y / snakeSize) * matrixSize.x) + (point.x / snakeSize))
		auxEmptyMatrixPoints.splice(index,0,point);
	}
	
	function moveTheSnake() {
		var point = {x: points[0].x, y: points[0].y};

		lastKey = key;
		switch(key){
			case 97: {point.x -= snakeSize;}break;
			case 100: {point.x += snakeSize;}break;
			case 115: {point.y += snakeSize;}break;
			case 119: {point.y -= snakeSize;}break;
			default: break;
		}

		points.unshift(point);
		removeEmptyMatrixPoints(point);
		if ( !theSnakeEat() ) {
			addEmptyMatrixPoints(points.pop());
		}
	}

	/**
	 * Draw the snake based on snake's array.
	 */
	function drawSnake(){

		/**
		 * Move the snake.
		 */
		moveTheSnake();

		/**
		 * Check if the snake keeps to eat. : )
		 */
		//theSnakeEat();

		if(		(canvas.width - snakeSize) < points[0].x 
			|| 	( 0 > points[0].x ) 
			|| 	( canvas.height - snakeSize) < points[0].y  
			|| 	( 0 > points[0].y ) )
		{
			gameStatus = "Lost";
			clearInterval(timer);
			console.log("Loser");
			return;
		}

		/**
		 * We must tu clean the canvas to redraw the food and the snake.
		 */
		clearCanvasAndSnake();

		/**
		 * Give the food to the snake.
		 */
		drawTheFood();

		/**
		 * Draw the snake on the canvas. Get take the snake array, and we draw him on the canvas.
		 */
		points.forEach( function(point, i){
			context.fillStyle = (i === 0 ? op.snakeHeadColor : op.snakeBobyColor);
			context.fillRect(point.x, point.y, snakeSize, snakeSize);
		});
	}

	function clearCanvasAndSnake(){
		// Clean all canvas.
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	function theSnakeEat() {
		if (points[0].x === food.x && points[0].y === food.y) {
			// She eat our good food.
			getMoreFoodToTheSnake();
			placardUpdate();
			return true;
		}
		return false;
	}

	function checkIfTheSnakeDied(){

	}

	function placardUpdate() {
		placard.innerHTML = points.length - op.snakeDefaultSize;
	}
	
	function drawTheFood(){
		context.beginPath();
		context.fillStyle = op.snakeFoodColor;
		context.strokeStyle = op.snakeFoodColor;
		context.arc(food.x + foodSize, food.y + foodSize, foodSize, 0, 2 * Math.PI, false);
		context.fill();
		context.stroke();
	}

	function getMoreFoodToTheSnake(){
		food = emptyMatrixPoints[Math.floor(Math.random()*(emptyMatrixPoints.length))];
	}

	/**
	 * We draw the canvas and the snake with windows adujst
	 */
	function drawSquareCanvas(){
		// Get the minimum value for our canvas based on window size.
		var canvasLength = window.innerWidth;
		if( window.innerWidth > window.innerHeight ){
			canvasLength = window.innerHeight;
		} 

		// The size of the snake is going to be 5% of our canvas minimum size.
		snakeSize = Math.floor( canvasLength * 0.05 );

		// We want a size with a odd value, otherwise we get the odd value down.
		if ( ( snakeSize % 2 ) != 0 ){
			snakeSize--;
		}

		// This is de raius to draw the food to feed the snake. Is going to be used on drawTheFood().
		foodSize = ( snakeSize / 2 );

		// To get a canvas with exactly x times snakeSize, for the snake fit perfectly inside tha canvas.
		matrixSize = Math.floor( canvasLength / snakeSize );
		if(matrixSize % 2 == 0){
			matrixSize--;
		}
		var panelHeight = document.getElementById("panel").clientHeight;
		canvasLength = ( snakeSize * matrixSize ) - ( Math.ceil(panelHeight * snakeSize ) * snakeSize );

		matrixSize = {
			x: matrixSize,
			y: matrixSize
		}

		// Draw the canvas.
		canvas.width = canvasLength;
		canvas.height = canvasLength;
		context = canvas.getContext("2d");
		document.getElementById("panel").style.width = context.canvas.clientWidth + ( context.canvas.clientLeft * 2 ) + "px";
	}

	function drawFullCanvas(){
		// Get the minimum value for our canvas based on window size.
		var canvasWidth = window.innerWidth;
		var canvasHeight = window.innerHeight;

		// The size of the snake is going to be 5% of our canvas minimum size.
		snakeSize = Math.floor( canvasWidth * 0.05 );
		if ( ( canvasWidth - canvasHeight ) > 0 ) {
			snakeSize = Math.floor( canvasHeight * 0.05 );
		}


		// We want a size with a odd value, otherwise we get the odd value down.
		if ( ( snakeSize % 2 ) != 0 ){
			snakeSize--;
		}

		// This is de raius to draw the food to feed the snake. Is going to be used on drawTheFood().
		foodSize = ( snakeSize / 2 );

		// To get a canvas with exactly x times snakeSize, for the snake fit perfectly inside tha canvas.
		var matrixSizeX = Math.floor( canvasWidth / snakeSize );
		if(matrixSizeX % 2 == 0){
			matrixSizeX--;
		}

		// Calculate normalized width
		canvasWidth = snakeSize * matrixSizeX;

		var matrixSizeY = Math.floor( canvasHeight / snakeSize );
		if(matrixSizeY % 2 == 0){
			matrixSizeY--;
		}

		// Calculate normalized height
		canvasHeight = ( snakeSize * matrixSizeY ) ;

		matrixSize = {
			x: matrixSizeX,
			y: matrixSizeY 
		}

		// Get some space for the panel.
		if ( ( window.innerHeight - canvasHeight ) < snakeSize ) {
			matrixSize.y -= 2 ;
			canvasHeight -= (snakeSize * 2);
		}

		// Draw the canvas.
		canvas.width = canvasWidth; //canvasLength;
		canvas.height = canvasHeight; //canvasLength;
		context = canvas.getContext("2d");

		//document.getElementById("panel").style.width = context.canvas.clientWidth + ( context.canvas.clientLeft * 2 ) + "px";
		// Draw the score panel
		var panel = document.getElementById("panel");

		// The width of the pane is the same of the canvas plus the border left and right.
		panel.style.width = context.canvas.clientWidth + ( context.canvas.clientLeft * 2 ) + "px";
		
		// The height of the panel is equals to window height minus canvas height minus the border
		// top and the border bottom.
		panel.style.height = (window.innerHeight - canvasHeight) - ( context.canvas.clientTop * 2 ) + "px";
		
		// The paragraph inside the panel is going to have an height equals to 
		// window height minus canvas height minus the border top and the border bottom minus
		// panel border bottom.
		panel.getElementsByTagName("p")[0].style.lineHeight = (window.innerHeight - canvasHeight) - ( context.canvas.clientTop * 3 ) + "px";
	}

	function start() {
		gameStatus = "Running";
		timer = setInterval(drawSnake, op.refreshTime);
	}

	function restart() {
		gameStatus = "Ready";
		snakeSize = 0;
		matrixSize = 0;
		canvas = "";
		context = "";
		timer = 0;
		points = [];
		key = 100;
		lastKey = 100;
		emptyMatrixPoints = [];
		food = {};
		foodSize = 1;
		theSnakeGetsFatter = false;
		placard = "";
		window.onload();
	}

	function pause() {
		gameStatus = "Paused";
		clearInterval(timer);
	}

	//       ---
	//      | W |
	//       --- 
	//  ---  ---  ---
	// | A || S || D |
	//  ---  ---  ---
	// Get keys from user.
	window.onkeypress = function(e){
		// If the key which was pressed was left or right and 
		// the last which was pressed was up or down then we change the key and vice versa.
		if ( ( e.keyCode === 97 || e.keyCode === 100 ) && ( lastKey === 115 || lastKey === 119 ) ) {
			key = e.keyCode;
		} else if ( ( e.keyCode === 115 || e.keyCode === 119 ) && ( lastKey === 97 || lastKey === 100 ) ) {
			key = e.keyCode;
		}

		//TODO This not work when we put the game paused.
		// Check if we can start the game.
		if( (gameStatus === "Ready" || gameStatus === "Paused") && ["s", "d", "w"].indexOf(e.key) > -1 ){
			start();
		}

		if ( (gameStatus === "Lost" || gameStatus === "Paused") && e.key === "r") {
			restart();
		}

		if ( gameStatus === "Running" && e.key === "p") {
			pause();
		}

	}


	// TODO: Add mousedown feature.
	function addMouseFeature() {

		var canvaPos = canvas.getBoundingClientRect();
		canvas.addEventListener('touchstart', function(event) {
			var client = {};

			switch( event.type ){
				case "touchstart": {
					client.x = event.changedTouches["0"].clientX;
					client.y = event.changedTouches["0"].clientY;
				} break;
				default: {
					client.x = event.clientX;
					client.y = event.clientY;
				} break;
			}

			var mousePositionX = Math.floor(client.x - canvaPos.left);
			var mousePositionY = Math.floor(client.y - canvaPos.top);

			// We take the snake position as a reference.
			if ( ( lastKey === 115 || lastKey === 119 ) ) {
				if ( mousePositionX < points[0].x) {
					key = "a".charCodeAt(); //a
				} else {
					key = "d".charCodeAt(); //d
				}
			} else if( ( lastKey === 97 || lastKey === 100 ) ){
				if ( mousePositionY < points[0].y) {
					key = "w".charCodeAt(); //w
				} else {
					key = "s".charCodeAt(); //s
				}
			}

			if( gameStatus === "Ready" || gameStatus === "Paused" ){
				start();
			}
		}, false);

		canvas.addEventListener('touchend', function(event) {
			event.preventDefault();
		});
	}


	function isEmpty(object){
		for ( var k in object ) {
			if (object.hasOwnProperty(k)) {
				return false;
			}
		}
		return true;
	}

	function log(t, h) {
		if (op.debug) {
			var header = "Log";
			if (h != null && typeof h === "string") {
				header = h;
			}
			console.log(header+": ");
			console.log(t);
			console.log("--------");
		}
	}

})(options);
