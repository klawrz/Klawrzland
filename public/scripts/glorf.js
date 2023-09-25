// JavaScript Document

//Canvas + Context
var canvas = document.getElementById("level");
var context = canvas.getContext("2d");

// Game time
const time = {start: performance.now(), elapsed: 0, lastTimestamp: 0};

// FPS
const FPS = 90;
const fpsInterval = 1000 / FPS;
time.lastTimestamp = time.start;

//Game State Handlers
var gameStarted = false;
var accessKey = false;
var completed = false;
//var lost = false;
var keys = [];

//Physics
var friction = 0.8;
var gravity = 0.98;

//Image Files
var playerImage = new Image();
playerImage.src = "/assets/player.png";

var keyImage = new Image();
keyImage.src = "/assets/key.png";

var doorImage = new Image();
doorImage.src = "/assets/door.png";



//Sounds & Volume
var jumpSfx = new Audio("/assets/jump.mp3");
var keySfx = new Audio("/assets/collect.wav");
var winSfx = new Audio("/assets/win.wav");
var deadSfx = new Audio("/assets/dead.ogg");
var theme = document.getElementById("theme");
theme.loop = true;



jumpSfx.volume = 0.1;
keySfx.volume = 0.1;
winSfx.volume = 0.1;
theme.volume = 0.1;
deadSfx.volume = 0.03;


	


//Player Object
var player = {
	x: 5,
	y: canvas.height-40,
	w: 40,
	h: 40,
	dx: 0,
	dy: 0,
	speed: 5,
	color: "#555555",
	grounded: false,
	jumpStrength: 7,
	jumping: false,
	shooting: false,
	position: "idle",
	draw: function(){
		startX = 40;
		if(this.position == "left"){
			startX = 0;
		} else if(this.position == "right"){
			startX = 80;
		}
		context.drawImage(playerImage, startX, 0, 40, 40, this.x, this.y, 40, 40);
	}
};

//Goal
var goal = {
	x: canvas.width-160,
	y: canvas.height-55,
	w: 30,
	h: 35,
	color: "#0098CB",
	draw: function(){
		context.drawImage(doorImage, this.x, this.y);
	}
};

//Key
	
var doorKey = {
	x: 0,
	y: 50,
	w: 20,
	h: 20,
	color: "orange",
	draw: function(){
		context.drawImage(keyImage, this.x, this.y);
	}
};

// Spikes/lava
var spikes = {
	x: canvas.width-160,
	y: canvas.height-110,
	w: 50,
	h: 30,
	color: "red",
	draw: function(){
		context.fillStyle = this.color;
		context.fillRect(this.x, this.y, this.w, this.h);
	}
}	

// Bullet
var bullet = {
	x: player.w/2,
	y: player.h/2,
	dx: 5,
	dy: 5,
	w: 10,
	h: 10,
	color: "blue",
	draw: function(){
		context.fillStyle = this.color;
		context.fillRect(this.x, this.y, this.w, this.h);
	}
}
	
//Platforms -- floor, walls, ceiling and platforms
var platforms = [];
var platformW = 60;
var platformH = 10;

//Floor
platforms.push({
	x: 0,
	y: canvas.height-20,
	w: 180,
	h: platformH
});
//Ceiling
platforms.push({
	x: 0,
	y: -10,
	w: canvas.width,
	h: platformH
});
//Left Wall
platforms.push({
	x: -10,
	y: 0,
	w: 10,
	h: canvas.height
});
//Right Wall
platforms.push({
	x: canvas.width,
	y: 0,
	w: 20,
	h: canvas.height
});
//Platform 1
platforms.push({
	x: 120,
	y: canvas.height/2,
	w: platformW,
	h: canvas.height/2
});
//Platform 2
platforms.push({
	x: 0,
	y: canvas.height/2+55,
	w: 20,
	h: 10
});
//Platform 3
platforms.push({
	x: canvas.width/2,
	y: canvas.height/2-55,
	w: 20,
	h: canvas.height
});
//Platform 4
platforms.push({
	x: canvas.width-180,
	y: canvas.height/2,
	w: 20,
	h: canvas.height
});
//Platform 5
platforms.push({
	x: canvas.width/2,
	y: 0,
	w: 20,
	h: 50
});
//Platform 6
platforms.push({
	x: canvas.width-110,
	y: canvas.height/2-105,
	w: 20,
	h: 225
});
//Platform 7
platforms.push({
	x: 0,
	y: 75,
	w: 40,
	h: 10
});
//Platform 8
platforms.push({
	x: canvas.width-160,
	y: canvas.height-80,
	w: 50,
	h: 20
});

//Goal Platform
platforms.push({
	x: canvas.width-160,
	y: canvas.height-10,
	w: 90,
	h: 10
});


//Event Listeners
document.body.addEventListener("keydown", (e) => {
	
	if(e.key == 'Enter' && !gameStarted){
		startGame();
	}
	
	if(e.key == 'Enter' && completed){
		reset();
	}

	if (e.key == ' ' || e.key == 'ArrowUp' || e.key == 'ArrowDown') {
		e.preventDefault();
	}

	keys[e.key] = true;
	
});

document.body.addEventListener("keyup", (e) => {
	
	keys[e.key] = false;
	
});


//Intro Screen
function introScreen(){
	context.font = "50px Impact";
	context.fillStyle = "#123456";
	context.textAlign = "center";
	context.fillText("Glorf's Quest", canvas.width/2, canvas.height/2);
	
	context.font = "20px Arial";
	context.fillText("Press Enter To Start Thy Quest", canvas.width/2, canvas.height/2+50);
}

introScreen();

//Start Game Function
function startGame(){
	gameStarted = true;
	//canvas.style.background = 'url(/assets/2d-forest.jpeg)';
	//canvas.style.backgroundSize = 'contain';
	theme.play();
	requestAnimationFrame(loop);
}

//Win Condition
function complete(){
	clearCanvas();
	completed = true;
	theme.pause();
	
	context.font = "50px Impact";
	context.fillStyle = "#0099CC";
	context.textAlign = "center";
	context.fillText("You have win this levels", canvas.width/2, canvas.height/2);
	
	context.font = "20px Arial";
	context.fillText("Press Enter for next levels", canvas.width/2, canvas.height/2+50);
}

//Lose Condition
function gameOver(){
	
	deadSfx.play();
	clearCanvas();
	completed = true;
	theme.pause();
	
	context.font = "40px Impact";
	context.fillStyle = "#ff0000";
	context.textAlign = "center";
	context.fillText("You have losed this levels, so sorries :(", canvas.width/2, canvas.height/2);
	
	context.font = "20px Arial";
	context.fillText("Press ENTR to PLAYGAINZ", canvas.width/2, canvas.height/2+50);
	
}


//Game Reset Function
function reset(){
	theme.currentTime = 0;
	theme.play()
	
	completed = false;
	accessKey = false;
	player.x = 5;
	player.y = canvas.height-40;
	player.dx = 0;
	player.dy = 0;
	player.speed = 5;
	player.grounded = true;
	
	requestAnimationFrame(loop);
}

//Platform Drawing Function
function drawPlatforms(){
	context.fillStyle = "#333333";
	for(var i=0; i < platforms.length; i++){
		context.fillRect(platforms[i].x, platforms[i].y, platforms[i].w, platforms[i].h);
	}
}

function shoot(){
	if(!player.shooting){
		player.shooting = true;
		bullet.x = player.x+20;
		bullet.y = player.y+20;
	}
}

//Loop Function
function loop(timestamp){

	if (!completed){
		requestAnimationFrame(loop);
	}

	time.elapsed = timestamp - time.lastTimestamp;

	if (time.elapsed > fpsInterval) {

		let adjustment = time.elapsed % fpsInterval;
		time.lastTimestamp = timestamp - adjustment;
	
		clearCanvas();
		drawPlatforms();
		player.draw();
		player.position = "idle";
		goal.draw();
		spikes.draw();
		
		if(!accessKey){
			doorKey.draw();
		}
		
		if(keys[' '] || keys['ArrowUp'] || keys['w']) {
			if(!player.jumping){
				jumpSfx.play();
				player.dy = -player.jumpStrength*2;
				player.jumping = true;
			}
		}
		
		if(keys['ArrowLeft'] || keys['a']){
			player.position = "left";
			if(player.dx > -player.speed){
				player.dx--;
			}
		}
		
		if(keys['ArrowRight'] || keys['d']){
			player.position = "right";
			if(player.dx < player.speed){
				player.dx++;
			}
		}
		
		if(keys['c'] || keys['p']){
			shoot();
		}
		
		player.x += player.dx;
		player.y += player.dy;
		
		
		player.dx *= friction;	
		player.dy += gravity;
		
		if(player.shooting) {
			bullet.draw();
			bullet.x += bullet.dx;
		}
		
		for(var i=0; i < platforms.length; i++){
			if(collisionCheck(bullet, platforms[i])) {
				player.shooting = false;
			}
		}

		player.grounded = false;
		for (i=0; i < platforms.length; i++) {
			var direction = collisionCheck(player, platforms[i]);
			
			if (direction == "left" || direction == "right") {
				player.dx = 0;
			} else if (direction == "bottom") {
				player.jumping = false;
				player.grounded = true;
			} else if (direction == "top") {
				player.dy *= -1;
			}
				
		}
		
		
		if(player.grounded){
			player.dy = 0;
		}
		
		if(player.y > canvas.height){
			gameOver();
		}
		
		if(collisionCheck(player, spikes)){
			gameOver();
		}
		
		if(collisionCheck(player, goal) && accessKey){
			winSfx.play();
			complete();
		}
		
		if(collisionCheck(player, doorKey)){
			if(!accessKey){
				keySfx.play();
			}
			accessKey = true;
		}

	}
}


//Collision Detection Function
function collisionCheck(character, platform){
	var vectorX = (character.x + (character.w/2)) - (platform.x + (platform.w/2));
	var vectorY = (character.y + (character.h/2)) - (platform.y + (platform.h/2));
	var halfWidths = (character.w/2) + (platform.w/2);
	var halfHeights = (character.h/2) + (platform.h/2);
	
	var collisionDirection = null;
										 

	if(Math.abs(vectorX) < halfWidths && Math.abs(vectorY) < halfHeights){
		
		var offsetX = halfWidths - Math.abs(vectorX);
		var offsetY = halfHeights - Math.abs(vectorY);
		if(offsetX < offsetY){
			if(vectorX > 0){
				collisionDirection = "left";
				character.x += offsetX;
			} else {
				collisionDirection = "right";
				character.x -= offsetX;
			}
		} else {
			if(vectorY > 0){
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
//Clear Canvas
function clearCanvas(){
	context.clearRect(0, 0, canvas.width, canvas.height);
}








