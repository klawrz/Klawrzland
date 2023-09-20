// Get reference to <canvas> element and create a context on which to draw
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

// Time & FPS
const time = { start: performance.now(), elapsed: 0, lastTimestamp: 0 }
time.lastTimestamp = time.start;
const FPS = 60;
const fpsInterval = 1000 / FPS;

// Periodic event timers
let mobTimer = 0;
let mobSpawnInterval = 30000;

// Physics
const friction = 0.9;
const gravity = 0.98;

// Game states
let started = false;
let completed = false;
let requestId = null;

let keys = [];

// Check if an array is empty
let isEmpty = a => Array.isArray(a) && a.every(isEmpty);

// Images
let playerImg = new Image();
playerImg.src = '/assets/player.png';

let heartImg = new Image();
heartImg.src = '/assets/heart.png';

let forestBgImg = new Image();
forestBgImg.src = '/assets/2d-forest.jpeg';

// Background scroll
let bigImgWidth = 0;
let scrollSpeed = 1;


// Sound FX
let jumpSfx = new Audio('/assets/jump.mp3');
let collectSfx = new Audio('/assets/collect.wav');
let shootSfx = new Audio('/assets/laser.wav');
let winSfx = new Audio('/assets/win.wav');

jumpSfx.volume = 0.1;
collectSfx.volume = 0.1;
shootSfx.volume = 0.05;
winSfx.volume = 0.2;





/*
// Class declarations
*/

// Game Objects parent class
class GameObject {
  constructor(x, y, w, h, color, type, id) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.type = type;
    this.id = id;
  }
  
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
  

  collisionCheck(character, platform) {

    let vectorX = (character.x + (character.w/2)) - (platform.x + (platform.w/2));
    let vectorY = (character.y + (character.h/2)) - (platform.y + (platform.h/2));
    let halfWidths = (character.w/2) + (platform.w/2);
    let halfHeights = (character.h/2) + (platform.h/2);
    
    let collisionDirection = null;
                      
    if (Math.abs(vectorX) < halfWidths && Math.abs(vectorY) < halfHeights) {
      
      let offsetX = halfWidths - Math.abs(vectorX);
      let offsetY = halfHeights - Math.abs(vectorY);

      if (offsetX < offsetY) {
        if (vectorX > 0) {
          collisionDirection = 'left';
          character.x += offsetX;
        } else {
          collisionDirection = 'right';
          character.x -= offsetX;
        }
      } else {  
        if (vectorY > 0) {
          collisionDirection = 'top';
          character.y += offsetY;
        } else {
          collisionDirection = 'bottom';
          character.y -= offsetY;
        }
      }
    }  
    return collisionDirection;
  }

}


// Characters
class Character extends GameObject {

  constructor(x, y, w, h, dx, dy, color, speed, jumpStrength, attackRate, hitRecovery, health, maxHealth, position, type, id) {
    super(x, y, w, h, color, type, id);
    this.dx = dx;
    this.dy = dy;
    this.speed = speed;
    this.jumpStrength = jumpStrength;
    this.attackRate = attackRate;
    this.hitRecovery = hitRecovery;
    this.health = health;
    this.maxHealth = maxHealth;
    this.position = position;

    this.shootingDirection = 'right';
    this.jumping = false;
    this.jumpReady = false;
    this.grounded = false;
    this.shooting = false;
    this.hit = false;

    this.rndSpeed = Math.random() < 0.5 ? 1 : 3;
  }

  jump() {
    if (!this.jumping) { 
      if (this == player) jumpSfx.play();
      this.dy = -this.jumpStrength * 2;
      this.jumping = true;
    }
  }
  
  moveLeft() {
    this.position = 'left';
    this.shootingDirection = 'left';
    if (this.dx > -this.speed) this.dx--;
  }

  moveRight() {
    this.position = 'right';
    this.shootingDirection = 'right';
    if (this.dx < this.speed) this.dx++;
  }

  reverseDirection() {
    if (this.position == 'left') this.moveRight();
    if (this.position == 'right') this.moveLeft();
  }

  shoot() {

    if (!this.shooting) {
      if (this == player) shootSfx.play();

      this.shooting = true;

      let bulletX, bulletW = 10, shooter = this;

      if (this.shootingDirection == 'right') bulletX = this.x + this.w;
      if (this.shootingDirection == 'left') bulletX = this.x;

      // Projectiles (x, y, w, h, dx, color, speed, direction, shooter, type)
      bullets.push(new Projectile(bulletX, this.y + this.h/2, bulletW, 5, 0, '#870400', 12, this.shootingDirection, shooter, 'bullet'));

      setTimeout(() => {
        this.shooting = false;
      }, this.attackRate);

    }

  }

  takeDamage() {
    this.hit = true;
    this.health--;
    this.color = '#F00';

    if (this.type == 'player') {
      setTimeout(() => { this.color = '#00F' }, 100);
      hearts.splice(-1, 1);
      if (this.health <= 0) gameOver();
    }

    if (this.type == 'mob') setTimeout(() => {this.color = '#F0F'}, 100);

    setTimeout(() => {this.hit = false}, this.hitRecovery);
  }

  heal(type) {
    let heartGap = 35;
    let lastHeart = hearts[hearts.length - 1];
    let heartX = lastHeart.x - heartGap;
    
    if (type == 'Health') {
      player.health++;
      hearts.push(new HudElement(heartX, 20, 20, 20, '#F00', 'heart'));
    }

    if (type == 'FullHealth') {
      player.health = player.maxHealth;
      while (hearts.length < player.health) {
        hearts.push(new HudElement(heartX, 20, 20, 20, '#F00', 'heart'));
        heartX -= heartGap;
      }
    }
  }

  patrol() {

    let rangeMin = 100;
    let rangeMax = canvas.width - 300;
    
    // Patrol
    if (this.x <= rangeMin && this.grounded) this.position = 'right';
    if (this.x >= rangeMax && this.grounded) this.position = 'left';

    if (this.position == 'right') this.moveRight();
    if (this.position == 'left') this.moveLeft();

    this.jumpReady = Math.random() > 0.95 ? true : false;

    if (this.jumpReady) {
      this.jump();
      this.jumpReady = false;
    }
    
    if (!this.shooting) this.shoot();

  }

  action() {

    this.position = 'idle';

    // Keys
    if (keys['ArrowLeft'] || keys['a']) this.moveLeft();
    if (keys['ArrowRight'] || keys['d']) this.moveRight();
    if (keys[' '] || keys['w'] || keys['ArrowUp'] && !this.jumping) this.jump();
    if (keys['l'] || keys['x'] && !this.shooting) this.shoot();

  }

  handleCollisions(entity) {
    let direction = this.collisionCheck(this, entity);

    
    if (direction == 'left' || direction == 'right') {
      this.dx = 0;
    } else if (direction == 'bottom') {
      this.jumping = false;
      this.grounded = true;
    } else if (direction == 'top') {
      this.dy *= -1;
    }

    // When there is a collision
    if (direction) {

      // If player is colliding with mob
      if ((this == player && entity.type == 'mob') || (this.type == 'mob' && entity == player)) {
        //  Player takes damage unless recovering from last hit
        if (player.health !== 0 && !player.hit) {
          player.takeDamage();
        } 
      }
      
      
      // If mob is stuck on other mob
      if (this.type == 'mob' && entity.type == 'mob' && this != entity) {
        // Mob runs a bit faster for a sec
        if (this.speed < 3) this.speed += 1;
        // Mob moves in the other direction
        this.reverseDirection();
        // Mob speed is randomized again
        setTimeout(() => {if (this.speed > 1) this.speed = this.rndSpeed;}, 1000)
      }
      
    }

  }
  
  collisions() {

    // When this.grounded is true, this.dy = 0 (i.e entity isn't moving up or down the Y axis)
    // Initialize as false so entity can fall, then set to True when entity touches ground
    this.grounded = false;

    // Platform collisions
    platforms.forEach((platform) => {
      this.handleCollisions(platform);
    });
    
    // Mob collisions
    mobs.forEach((mob) => {
      if (this.type == 'mob') {
        // Mob collides with player
        this.handleCollisions(player);

        // Mob collides with other mob
        if (this != mob) {
          this.handleCollisions(mob);
        }
      }

      // Player collides with mob
      if (this == player) {
        this.handleCollisions(mob);
      }
    });
    
  }

  update() {

    // Player actions
    if (this.type == 'player') {
      this.action();
      if (this.health <= 0) gameOver();
    }

    // Mob actions
    if (this.type == 'mob') {
      this.patrol();
    }
    
    // Update x/y values to move object
    this.x += this.dx;
    this.y += this.dy;

    // Physics
    this.dx *= friction;
    this.dy += gravity;

    // Collisions
    this.collisions();

    // Prevent falling through floors
    if (this.grounded) this.dy = 0;

    // Handle entity leaves boundaries
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      if (this == player) gameOver();
      if (this.type == 'mob') mobs.splice(mobs.indexOf(this), 1);
    }

    // Add a new mob every interval
    if (mobTimer > mobSpawnInterval) {
      if (mobs.length < 6 ) newMob();
      mobTimer = 0;
    } else {
      mobTimer += time.elapsed;
    }
      
  }

}


// Projectiles
class Projectile extends GameObject {

  constructor(x, y, w, h, dx, color, speed, direction, shooter, type) {
    super(x, y, w, h, color, type);
    this.dx = dx;
    this.speed = speed;
    this.direction = direction;
    this.shooter = shooter;
  }

  collisions() {
    
    // Bullet hits player
    if (this.shooter != player) {
      if (this.collisionCheck(this, player)) {
        bullets.splice(bullets.indexOf(this), 1);
        if (player.health !== 0 && !player.hit) player.takeDamage();
      }
    }
    
    // Bullet hits platform
    platforms.forEach((platform) => {
      if (this.collisionCheck(this, platform)) {
        bullets.splice(bullets.indexOf(this), 1)
      }
    });

    // Bullet hits mob
    mobs.forEach((mob) => {
      if (this.shooter.type != 'mob') {
        if (this.collisionCheck(this, mob)) {
          if (mob.health !== 0 && !mob.hit) mob.takeDamage();
          if (mob.health <= 0) mobs.splice(mobs.indexOf(mob), 1);
          bullets.splice(bullets.indexOf(this), 1);
        }
      }
    });

  }

  update() {

    if (this.direction == 'right') {
      if (this.x < canvas.width) this.dx = this.speed;
    }

    if (this.direction == 'left') {
      if (this.x > 0) this.dx = -this.speed;
    }
    
    this.x += this.dx;

    this.collisions();
    
  }

}


// Collectibles
class Collectible extends GameObject {
  constructor(x, y, w, h, color, type, id) {
    super(x, y, w, h, color, type, id);
  }

  draw() {
    ctx.fillStyle = this.color;

    if (this.type == 'collectible') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 10, 0, Math.PI*2);
      ctx.fill();
      ctx.closePath();
    }
  }

  collisions() {
    if (this.collisionCheck(this, player)) {
      collectibles.splice(collectibles.indexOf(this), 1);
      collectSfx.play();
      if ((this.id == 'Health' || this.id == 'FullHealth') && player.health < player.maxHealth) player.heal(this.id);
    }
  }

  update() {
    this.collisions();
  }
}


// Heads Up Display (HUD)
class HudElement extends GameObject {
  constructor(x, y, w, h, color, type) {
    super(x, y, w, h, color, type);
  }

  draw() {
    ctx.fillStyle = this.color;

    if (this.type == 'heart') {
      ctx.drawImage(heartImg, this.x, this.y);
    }
    if (this.type == 'background') {
      if (started) {
        ctx.drawImage(forestBgImg, bigImgWidth, 0, canvas.width, canvas.height);
        ctx.drawImage(forestBgImg, bigImgWidth - canvas.width, 0, canvas.width, canvas.height);
      } else {
        ctx.fillRect(this.x, this.y, this.w, this.h);
      }
    }
  } 

  update() {
    if (this.type == 'background') {
      bigImgWidth += scrollSpeed;
      if (bigImgWidth == canvas.width) bigImgWidth = 0;
    }
  }
}


/*
// Utility functions
*/

function random(min, max) {
  let randomNum = Math.random() * (max - min +1) + min;
  return randomNum;
}



/*
// Game Objects initialization
*/

let player, mobs, platforms, bullets, collectibles, hearts, background;

function initObjects() {
  initPlayer();
  initMobs();
  initPlatforms();
  initBullets();
  initCollectibles();
  initHud();
}


/*
// Characters (x, y, w, h, dx, dy, color, speed, jumpStrength, attackRate, hitRecovery, health, maxHealth, position, type, id)
*/

// Player
function initPlayer() {
  player = null;
  player = new Character(20, canvas.height/2, 30, 30, 0, 0, '#00F', 8, 10, 200, 1000, 10, 10, 'idle', 'player', 'Player');
}

// Mobs
function initMobs() {
  mobs = [];
  let mobCount = 3;
  
  for (i = 0, mobX = 200, facing = null, mobSpeed = null; mobs.length < mobCount; i++) {
    newMob();
  }
}

function newMob() {
  facing = Math.random() <= 0.5 ? 'left' : 'right';
  mobs.push(new Character(random(100, 600), (canvas.height - 100), 20, 40, 0, 0, '#F0F', random(1, 2), 7, 700, null, 3, 3, facing, 'mob', `Mob${mobs.length}`));
}

/*
// Projectiles (x, y, w, h, dx, color, speed, type)
*/

// Bullets (array filled when Character shoots)
function initBullets() {
  bullets = [];
}



/*
// Platforms (x, y, w, h, color, type, id)
*/

function initPlatforms() {
  platforms = [];
  const platformColor = '#000';

  // Boundaries
  const roof = platforms.push(new GameObject(0, 0, canvas.width, 10, platformColor, 'platform', 'Roof'));
  const floor = platforms.push(new GameObject(0, canvas.height-20, canvas.width - 200, 10, platformColor, 'platform', 'Floor'));
  const leftWall = platforms.push(new GameObject(0, 0, 10, canvas.height, platformColor, 'platform', 'LeftWall'));
  const rightWall = platforms.push(new GameObject(canvas.width-10, 0, 10, canvas.height, platformColor, 'platform', 'RightWall'));

  // Static platforms
  const platform04 = platforms.push(new GameObject(0, 400, 90, 10, platformColor, 'platform', 'Platform04'));
  const platform05 = platforms.push(new GameObject(600, 500, 45, 10, platformColor, 'platform', 'Platform05'));
  const platform06 = platforms.push(new GameObject(480, 415, 45, 10, platformColor, 'platform', 'Platform06'));
  const platform07 = platforms.push(new GameObject(350, 300, 45, 10, platformColor, 'platform', 'Platform07'));
  const platform08 = platforms.push(new GameObject(150, 145, 45, 10, platformColor, 'platform', 'Platform08'));
  const platform09 = platforms.push(new GameObject(600, 145, 45, 10, platformColor, 'platform', 'Platform09'));
  const platform10 = platforms.push(new GameObject(840, 145, 45, 10, platformColor, 'platform', 'Platform10'));
}



/*
// Collectibles(x, y, w, h, color, type, id)
*/

function initCollectibles() {
  collectibles = [];

  // Health
  collectibles.push(new Collectible((platforms[8].x + platforms[8].w/2), (platforms[8].y - 15), 20, 20, '#F00', 'collectible', 'Health'));

  // Full health
  collectibles.push(new Collectible((platforms[10].x + platforms[10].w/2), (platforms[10].y - 15), 20, 20, '#9000FF', 'collectible', 'FullHealth'));
}


/*
// HUD Elements (x, y, w, h, color, type)
*/

function initHud() {
  // Hearts
  hearts = [];
  let heartGap = 35;
  let heartX = (canvas.width - platforms[3].w) - heartGap;

  while (hearts.length < player.health) {
    hearts.push(new HudElement(heartX, 20, 20, 20, '#F00', 'heart'));
    heartX -= heartGap;
  }

  // Background
  background = new HudElement(0, 0, canvas.width, canvas.height, '#fff', 'background');
}



/*
// Event Listeners
*/

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function handleKeyDown(e) {
  keys[e.key] = true;

  // Prevent defaults of certain keys
  if (keys['ArrowDown'] || keys['ArrowUp'] || keys[' ']) e.preventDefault();

  // Start the game
  if (keys['Enter'] && !started && !completed) {
    initObjects();
    start();
  }
	
  // Reset the game
	if (keys['Enter'] && completed) reset();

  // Pause the game
  if (keys['p']) {
    if (started) 
      pause();
    else 
      start();
  }
}

function handleKeyUp(e) {
  keys[e.key] = false;
}


/*
// Game States
*/

function introScreen(){

	ctx.fillStyle = '#123456';
	ctx.textAlign = 'center';

  ctx.font = '26px Impact';
	ctx.fillText("Test environment", canvas.width/2, canvas.height/2-50);

  ctx.font = '50px Impact';
  ctx.fillText("Sandbox", canvas.width/2, canvas.height/2+15);
	
	ctx.font = '20px Arial';
	ctx.fillText('Press Enter To Test The Environment', canvas.width/2, canvas.height/2+60);
}
introScreen(); // Display the intro screen // Should we put this in an onload?

function start() {
  started = true;
  requestAnimationFrame(animate);
}

function reset() {
  completed = false;
  initObjects();
  start();
}
  
function stopGame() {
  cancelAnimationFrame(requestId);
  clearCanvas();
  started = false;
}

function pause() {
  // Pause the game
  stopGame();
  
  ctx.fillStyle = '#123456';
	ctx.textAlign = 'center';

  ctx.font = '50px Impact';
  ctx.fillText("GAME PAUSED", canvas.width/2, canvas.height/2+15);
}

function complete() {
	
  stopGame();
  completed = true;

	//theme.pause();
  winSfx.play();
	
	ctx.fillStyle = '#0099CC';
	ctx.textAlign = 'center';

  ctx.font = '24px Impact';
	ctx.fillText('LEVEL ACHIEVED', canvas.width/2, canvas.height/2-50);

  ctx.font = '50px Impact';
	ctx.fillText('YOU WIN!!', canvas.width/2, canvas.height/2+15);
	
	ctx.font = '20px Arial';
	ctx.fillText('Press ENTER to continue', canvas.width/2, canvas.height/2+60);

}

function gameOver() {
	
  stopGame();
  completed = true;

	//theme.pause();
	//deadSfx.play();
	
	ctx.fillStyle = '#ff0000';
	ctx.textAlign = 'center';

  ctx.font = '26px Impact';
	ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2-50);

  ctx.font = '50px Impact';
	ctx.fillText('YOU LOSE!!', canvas.width/2, canvas.height/2+15);
	
	ctx.font = '20px Arial';
	ctx.fillText('Press ENTER to play again', canvas.width/2, canvas.height/2+60);
	
}



/*
// Animation
*/

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
  background.update();
  player.update();
  bullets.forEach((bullet) => {
    bullet.update();
  });
  mobs.forEach((mob) => {
    mob.update();
  });
  collectibles.forEach((collectible) => {
    collectible.update();
  });
}

function draw() {
  background.draw();
  platforms.forEach((platform) => {
    platform.draw();
  });
  player.draw();
  mobs.forEach((mob) => {
    mob.draw();
  });
  bullets.forEach((bullet) => {
    bullet.draw();
  });
  hearts.forEach((heart) => {
    heart.draw();
  });
  collectibles.forEach((collectible) => {
    collectible.draw();
  });
  
}

function animate(timestamp) {

  if (!completed) requestId = requestAnimationFrame(animate);

  time.elapsed = timestamp - time.lastTimestamp;

  if (time.elapsed > fpsInterval) {

    let adjustment = time.lastTimestamp % fpsInterval;
    time.lastTimestamp = timestamp - adjustment;

    clearCanvas();
    update(); if (completed) return
    draw();

  }

  // Win condition
  if (isEmpty(mobs)) complete();

}

