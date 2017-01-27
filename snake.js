	//TODO: Bug da comida escondida.
	//TODO: Bug de perder ao apanhar a comida do lado direito encostado à borda.

	var options = {};
	(function(op){
		
		'use strict';

		// null is equals to undefined
		if ( op == null || isEmpty(op) ) {
			op = {
				snakeBobyColor: "Green",
				snakeHeadColor: "DarkGreen",
				snakeFoodColor: "LightGreen",
				snakeDefaultSize: 5,
				debug: true,
				refreshTime: 100 // Insert a value in milliseconds.
			};
		}

		var gameStatus = "Ready";
		var snakeSize;
		var matrixSize;
		var canvas;
		var context;
		var timer;
		var points = [];
		var key = 100;
		var lastKey = 100;
		var emptyMatrixPoints = [];
		var food = {};
		var foodSize = 1;
		var theSnakeGetsFatter = false;
		var placard;

		window.onload = function(){
			canvas = document.getElementById("board");
			placard = document.getElementById("score");
			
			drawCanvas();
			
			for (var i = 0; i < op.snakeDefaultSize; i++) {
				points.push({
					x: Math.floor( matrixSize / 2 ) * snakeSize - ( i * snakeSize ), 
					y: Math.floor( matrixSize / 2 ) * snakeSize
				});
			}

			placardUpdate();
			getEmptyMatrixPoints();
			getMoreFoodToTheSnake();
			drawTheFood();
			drawSnake();

			//timer = setInterval(drawSnake, op.refreshTime);
		};	

		/**
		 * We are going to use this function to calculate a empty point to put the snake's food.
		 * We cant not put food at the points filled by the snake, she can bit us :).
		 */
		function getEmptyMatrixPoints(){
			/**
			 * Based on matrix size we are going to generate an array with all empty points.
			 * Thus we can easly select a point to draw the food to the snake.
			 * We start to think that all points are empty. But is not true, at this point we already have
			 * created the snake, and the snake's points are not empty.
			 */
			for (var i = 0; i < matrixSize; i++) {
				for (var j = 0; j < matrixSize; j++) {
		    		emptyMatrixPoints.push({ 
		    							x: (i * snakeSize), 
		    							y: (j * snakeSize)
		    						});
				}
			}

			/**
			 * We use this routine to remove the snake's points from the matrix. How this points are fill
			 * by the snake they are not empty. Make sense :)
			 */
			for (var i = 0; i < points.length; i++) {
				/**
				 * We use an array to manage the empty points, so next formula transform a matrix point 
				 * in a array point. Thus we can remove the fill points from de enpty matrix points.
				 */
				var index = (((points[i].y / snakeSize) * matrixSize) + (points[i].x / snakeSize));
				emptyMatrixPoints.splice(index,1);
			}
			log(emptyMatrixPoints);
		}

		function removeEmptyMatrixPoints(point) {
			var index = (((point.y / snakeSize) * matrixSize) + (point.x / snakeSize))
			emptyMatrixPoints.splice(index,1);
		}

		function addEmptyMatrixPoints(point) {
			var index = (((point.y / snakeSize) * matrixSize) + (point.x / snakeSize))
			emptyMatrixPoints.splice(index,0,point);
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
		function drawCanvas(){
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
			canvasLength = snakeSize * matrixSize;

			// Draw the canvas.
			canvas.height = canvasLength;
			canvas.width = canvasLength;
			context = canvas.getContext("2d");
		}

		function start() {
			timer = setInterval(drawSnake, op.refreshTime);
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

			if( (gameStatus === "Ready" || gameStatus === "Paused") && ["s", "d", "w"].indexOf(e.key) > -1 ){
				gameStatus = "Running";
				start();
			}
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









