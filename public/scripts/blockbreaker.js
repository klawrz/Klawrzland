// Help with FPS throttle: https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe

const canvas = document.querySelector('#canvas');
		const ctx = canvas.getContext('2d');

		const gravity = 0.98;
		const friction = 0.9;
    const time = {start: performance.now(), elapsed: 0, lastTimestamp: 0};

		const BALL_SPEED = 3;
		const BALL_RADIUS = 10;

		const PADDLE_WIDTH = 90;
		const PADDLE_HEIGHT = 10;

		const DROP_SPEED = 2;

		// FPS throttle
		const FPS = 120;
		const fpsInterval = 1000 / FPS;
		time.lastTimestamp = time.start;

		// Game state handlers
		let gameStarted = false;
		let completed = false;
		let isEmpty = a => Array.isArray(a) && a.every(isEmpty);

		var keys = [];
		var walls = [];
		var bricks = [];
		var remainingBricks = [];
		var drops = [];
		let usedDrops = [];
		let dropBuffer = [];

		var columns = 10;
		var rows = 4;

		var ball = {
			x: Math.random() * canvas.width,
			y: canvas.height/2,
			w: BALL_RADIUS,
			h: BALL_RADIUS,
			//dx: Math.random() > 0.5? 5 : -5,
			//dy: -5,
			speed: BALL_SPEED,
			radius: BALL_RADIUS,
			draw: function() {
				ctx.fillStyle = '#000000';
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.radius, 0 * Math.PI, 2 * Math.PI);
				ctx.fill();
			}
		}

		ball.dx = Math.random() > 0.5? ball.speed : -ball.speed;
		ball.dy = -ball.speed;

		var paddle = {
			x: canvas.width/2 - 45,
			y: canvas.height - 20,
		  w: PADDLE_WIDTH,
		  h: PADDLE_HEIGHT,
			dx: 0,
			dy: 0,
			speed: 7,
			power: null,
			draw: function() {
				ctx.beginPath();
				ctx.fillStyle = '#000000';
				ctx.fillRect(this.x, this.y, this.w, this.h);
			}
		}

		var brick = {
			w: 75,
			h: 20,
			padding: 10,
			offsetTop: 30,
			offsetLeft: 30
		}

		// Top wall
		walls.push({
			x: 0,
			y: 0,
			w: canvas.width,
			h: 10
		});
		
		// Left wall
		walls.push({
			x: 0,
			y: 0,
			w: 10,
			h: canvas.height
		});

    // Right wall
		walls.push({
			x: canvas.width - 10,
			y: 0,
			w: 10,
			h: canvas.height
		});

		// Bottom wall
		/*
		walls.push({
			x: 0,
			y: canvas.height - 10,
			w: canvas.width,
			h: 10
		});
		*/

		drops.push({
			x: null,
			y: null,
			w: 20,
			h: 20,
			speed: DROP_SPEED,
			status: 0,
			dropped: false,
			type: 'bigPaddle'
		});

		drops.push({
			x: null,
			y: null,
			w: 20,
			h: 20,
			speed: DROP_SPEED,
			status: 0,
			dropped: false,
			type: 'smallPaddle'
		});

		drops.push({
			x: null,
			y: null,
			w: 20,
			h: 20,
			speed: DROP_SPEED,
			status: 0,
			dropped: false,
			type: 'fastPaddle'
		});

		drops.push({
			x: null,
			y: null,
			w: 20,
			h: 20,
			speed: DROP_SPEED,
			status: 0,
			dropped: false,
			type: 'slowPaddle'
		});

		drops.push({
			x: null,
			y: null,
			w: 20,
			h: 20,
			speed: DROP_SPEED,
			status: 0,
			dropped: false,
			type: 'fastBall'
		});

		drops.push({
			x: null,
			y: null,
			w: 20,
			h: 20,
			speed: DROP_SPEED,
			status: 0,
			dropped: false,
			type: 'slowBall'
		});

		
		

		function drawWalls() {
			walls.forEach((wall) => {
				ctx.fillStyle = '#000000';
				ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
			});
		}

		function initBricks() {
			for (c = 0; c < columns; c++) {
			bricks[c] = [];
				for (r = 0; r < rows; r++) {
					bricks[c][r] = {x: 0, y: 0, w: brick.w, h: brick.h, status: 1, hasDrop: 0, dropType: null};
					bricks[c][r].x = (c * (brick.w + brick.padding)) + brick.offsetLeft;
					bricks[c][r].y = (r * (brick.h + brick.padding)) + brick.offsetTop;
				}
		  }
		}

		function updateBricks() {
			for (c = 0; c < columns; c++) {
				remainingBricks[c] = [];
				for (r = 0; r < rows; r++) {
					let b = bricks[c][r];
					if (b.status) {
						remainingBricks[c].push(b);
					}
				}
			}
		}

		function drawBricks() {
			for (c = 0; c < remainingBricks.length; c++) {
				for (r = 0; r < remainingBricks[c].length; r++) {
					var b = remainingBricks[c][r];
					ctx.fillStyle = b.hasDrop ? '#ff0000' : '#000000';
					ctx.fillRect(b.x, b.y, b.w, b.h);
				}
			}
		}

		function initDrops() {
			var dropsAssigned = 0;
			let unassignedDrops = drops.map(item => {
				//console.log(item)
				return item
			});
			let b, d;
			while (dropsAssigned < drops.length) {
				for (c = 0; c < columns; c++) {
					for (r = 0; r < rows - 1; r++) {
						b = bricks[c][r];
						d = Math.floor(Math.random() * unassignedDrops.length);
						if (dropsAssigned < drops.length) {
							if (!b.hasDrop) {
								b.hasDrop = Math.random() > 0.9? 1 : 0;
								if (b.hasDrop) {
									//console.log('Assigning drop ' + unassignedDrops[d].type + ' to brick ' + '[' + c + '], ' + '[' + r + ']');
									b.dropType = unassignedDrops[d].type;
									unassignedDrops.splice(d, 1);
									dropsAssigned++;
									drops.forEach(drop => {
										if (drop.type == b.dropType) {
											drop.x = (b.x + brick.w /2) - drop.w/2;
										  drop.y = b.y + brick.h/2;
									  }
									});
								}
							}
						} else {
							break;
						}
					}
					if (dropsAssigned == drops.length) {
						break;
					}
				}
			}
		}

		function drawDrops() {
			drops.forEach(drop => {
				if (drop.status) {
					ctx.fillStyle = '#00FF00';
				  ctx.fillRect(drop.x, drop.y, drop.w, drop.h);
				  if (drop.y < canvas.height) {
				    drop.y += drop.speed;
			    } else {
			    	drop.status = 0;
			    }
			    if (collisionCheck(drop, paddle)) {
			    	drop.status = 0;
			    	paddle.power = drop.type;
			    	powerUp();
			    	
			    	console.log('power applied: ' + paddle.power);
			    }
				}
			});
		}

		function powerUp() {
			let duration = 5000;
			const BALL_SPEED_MOD = 2;
			const PADDLE_SPEED_MOD = 5;
			let paddleWidthMod;

    	switch (paddle.power) {
    		  case 'bigPaddle':
    		  paddleWidthMod = paddle.w/2 + 5;
    		  paddle.x -= paddleWidthMod/2;
    		  paddle.w += paddleWidthMod;
    		  setTimeout(() => {
    		  	paddle.x += paddleWidthMod/2;
    		  	paddle.w -= paddleWidthMod;
    		  	paddle.power = null;
    		  }, duration);
    		  break;

    		case 'smallPaddle':
    		  console.log('paddle.w: ' + paddle.w);
    		  paddleWidthMod = paddle.w/3;
    		  paddle.x += paddleWidthMod/2;
    		  paddle.w -= paddleWidthMod;
    		  setTimeout(() => {
    		  	paddle.x -= paddleWidthMod/2;
    		  	paddle.w += paddleWidthMod;
    		  	paddle.power = null;
    		  }, duration);
    		  break;

    		case 'fastPaddle':
    		  paddle.speed += PADDLE_SPEED_MOD;
    		  setTimeout(() => {
    		  	paddle.speed -= PADDLE_SPEED_MOD;
    		  	paddle.power = null;
    		  }, duration);
    		  break;

    		case 'slowPaddle':
    		  paddle.speed -= PADDLE_SPEED_MOD;
    		  setTimeout(() => {
    		  	paddle.speed += PADDLE_SPEED_MOD;
    		  	paddle.power = null;
    		  }, duration);
    		  break;

    		case 'fastBall':
					ball.speed += BALL_SPEED_MOD;

					if (ball.dx > 0) {
    		    ball.dx = ball.speed;
	    		} else {
	    		  ball.dx = -ball.speed;
	    		}

					if (ball.dy > 0) {
						ball.dy = ball.speed;
					} else {
						ball.dy = -ball.speed;
					}

    		  setTimeout(() => {
    		  	ball.speed = BALL_SPEED;

						if (ball.dx > 0) {
							ball.dx = ball.speed;
						} else {
							ball.dx = -ball.speed;
						}
	
						if (ball.dy > 0) {
							ball.dy = ball.speed;
						} else {
							ball.dy = -ball.speed;
						}
						paddle.power = null;
					}, duration);
    		  break;

  		  case 'slowBall':
	  		  ball.speed -= BALL_SPEED_MOD;

					if (ball.dx > 0) {
    		    ball.dx = ball.speed;
	    		} else {
	    		  ball.dx = -ball.speed;
	    		}

					if (ball.dy > 0) {
						ball.dy = ball.speed;
					} else {
						ball.dy = -ball.speed;
					}

    		  setTimeout(() => {
    		  	ball.speed = BALL_SPEED;

						if (ball.dx > 0) {
							ball.dx = ball.speed;
						} else {
							ball.dx = -ball.speed;
						}
	
						if (ball.dy > 0) {
							ball.dy = ball.speed;
						} else {
							ball.dy = -ball.speed;
						}
						paddle.power = null;
					}, duration);
	  		  break;
    	}
		}

		document.body.addEventListener('keydown', (e) => {
			if(e.key == 'Enter' && !gameStarted) {
				startGame();
			}
			
			if(e.key == 'Enter' && completed) {
				reset();
			}
			keys[e.key] = true;
		});

		document.body.addEventListener('keyup', (e) => {
			keys[e.key] = false;
		});

		function init() {
			initBricks();
			initDrops();
		}

		//Intro Screen
		function introScreen() {

			drawWalls();

			ctx.font = "50px Impact";
			ctx.fillStyle = "#123456";
			ctx.textAlign = "center";
			ctx.fillText("Blockbreaker", canvas.width/2, canvas.height/2);
			
			ctx.font = "20px Arial";
			ctx.fillText("Press Enter To BREAK BLOCKS", canvas.width/2, canvas.height/2+50);
		}
		
		//Win Condition
		function complete() {
			clearCanvas();
			completed = true;
			
			ctx.font = "50px Impact";
			ctx.fillStyle = "#0099CC";
			ctx.textAlign = "center";
			ctx.fillText("You have win this levels", canvas.width/2, canvas.height/2);
			
			ctx.font = "20px Arial";
			ctx.fillText("Press Enter for next levels", canvas.width/2, canvas.height/2+50);
		}

		function startGame() {
			gameStarted = true;
			requestAnimationFrame(loop);
		}

		//Lose Condition
		function gameOver() {
			
			clearCanvas();
			completed = true;
			
			drawWalls();

			ctx.font = "40px Impact";
			ctx.fillStyle = "#ff0000";
			ctx.textAlign = "center";
			ctx.fillText("That all you GOT?!", canvas.width/2, canvas.height/2);
			
			ctx.font = "20px Arial";
			ctx.fillText("Press ENTER to play again", canvas.width/2, canvas.height/2+50);
			
		}

		//Game Reset Function
		function reset() {
			
			completed = false;

			// Paddle
			paddle.x = canvas.width/2 - 45;
			paddle.y = canvas.height - 20;
			paddle.w = PADDLE_WIDTH;
			paddle.h = PADDLE_HEIGHT;
			paddle.dx = 0;
			paddle.dy = 0;
			paddle.speed = 7;
			paddle.power = null;

			// Ball
			ball.x = Math.random() * canvas.width;
			ball.y = canvas.height/2;
			ball.speed = BALL_SPEED;
			ball.dx = Math.random() > 0.5? ball.speed : -ball.speed;
			ball.dy = -ball.speed;
			

			// Drops
			drops.forEach((drop) => {
				drop.status = 0;
			});

			initBricks();
			initDrops();
			
			requestAnimationFrame(loop);
		}

	  // Start loop
		function loop(timestamp) {

			time.elapsed = timestamp - time.lastTimestamp;

			if (!completed) {
				requestAnimationFrame(loop);
			}

			if (time.elapsed > fpsInterval) {

				let adjustment = time.elapsed % fpsInterval;
				time.lastTimestamp = timestamp - adjustment;

				clearCanvas();
				drawWalls();
				updateBricks();
				drawBricks();
				ball.draw();
				paddle.draw();
				drawDrops();

				if (keys['ArrowLeft'] || keys['a']) {
					if (paddle.dx > -paddle.speed) {
						paddle.dx--;
					}
				}

				if (keys['ArrowRight'] || keys['d']) {
					if (paddle.dx < paddle.speed) {
						paddle.dx++;
					}
				}

				if (collisionCheck(ball, paddle)) {
					ball.dy = -ball.dy;
				}

				walls.forEach(function (wall) {
					if (collisionCheck(ball, wall)) {
						switch(wall) {
							case walls[0]:
								ball.dy = -ball.dy;
								break;
							case walls[1]:
								ball.dx = -ball.dx;
								break;
							case walls[2]:
								ball.dx = -ball.dx;
								break;
							case walls[3]:
								ball.dy = -ball.dy;
								break;
						}
					}
					
					if (collisionCheck(paddle, wall)) {
						paddle.dx = 0;
					}
				})

				for (c = 0; c < remainingBricks.length; c++) {
					for (r = 0; r < remainingBricks[c].length; r++) {
						let b = remainingBricks[c][r];
						var collision = collisionCheck(ball, b);
						if (collision) {
							switch (collision) {
								case 'top':
									ball.dy = -ball.dy;
									break;
								case 'bottom':
									ball.dy = -ball.dy;
									break;
								case 'left':
									ball.dx = -ball.dx;
									break;
								case 'right':
									ball.dx = -ball.dx;
									break;
							}
							b.status = 0;
							if (b.hasDrop) {
								drops.forEach(drop => {
									if (drop.type == b.dropType && !drop.status) {
										drop.status = 1;
									}
								});
							}
						}
					}
				}

				paddle.x += paddle.dx;
				paddle.dx *= friction;

				ball.y += ball.dy;
				ball.x += ball.dx;

				if (ball.y - ball.h > canvas.height) {
					gameOver();
				}

				if (isEmpty(remainingBricks)) {
					complete();
				}

			}



		}

		function clearCanvas() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}

		//Collision Detection Function
		function collisionCheck(character, platform) {
			var vectorX = (character.x + (character.w/2)) - (platform.x + (platform.w/2));
			var vectorY = (character.y + (character.h/2)) - (platform.y + (platform.h/2));
			var halfWidths = (character.w/2) + (platform.w/2);
			var halfHeights = (character.h/2) + (platform.h/2);
			
			var collisionDirection = null;
												 

			if(Math.abs(vectorX) < halfWidths && Math.abs(vectorY) < halfHeights) {
				
				var offsetX = halfWidths - Math.abs(vectorX);
				var offsetY = halfHeights - Math.abs(vectorY);
				if(offsetX < offsetY) {
					if(vectorX > 0) {
						collisionDirection = "left";
						character.x += offsetX;
					} else {
						collisionDirection = "right";
						character.x -= offsetX;
					}
				} else {
					if(vectorY > 0) {
						collisionDirection = "top";
						character.y += offsetY;
					} else {
						collisionDirection = "bottom";
						character.y -= offsetY;
					}
				}

			}
			
			return collisionDirection;
			
		}

		init();
		introScreen();