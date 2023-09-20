const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

let knobs = document.querySelectorAll('.knob');
let knobsContainer = document.querySelector('.knobs-container');

var rad, deg, pos360, lastPos;

let moveAmount = 5;
const { width, height } = canvas;

var isDrawing = false;

let x = Math.floor(Math.random() * width);
let y = Math.floor(Math.random() * height);

ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = 5;

ctx.strokeStyle = '#000';
ctx.beginPath();
ctx.moveTo(x, y);
ctx.lineTo(x, y);
ctx.stroke();

function draw({ key }) {

  if (key == null) {
    moveAmount = 1;
  } else {
    moveAmount = 5;
  }

  ctx.beginPath();
  ctx.moveTo(x, y);
  switch (key) {
    case 'ArrowUp':
      decreaseY();
      break;

    case 'ArrowRight':
      increaseX();
      break;

    case 'ArrowDown':
      increaseY();
      break;

    case 'ArrowLeft':
      decreaseX();
      break;

    default:
      break;
  }
  ctx.lineTo(x, y);
  ctx.stroke();
}

// Only change x/y value if within canvas boundaries
function decreaseY() {
  console.log('Y = ' + y);
  if (y > 0 ) {
    if (y < moveAmount) {
      y -= y;
    }
    else {
      y -= moveAmount;
    }
  }
}
function increaseY() {
  console.log('Y = ' + y);
  if (y < height ) {
    if (y > height - moveAmount) {
      y += height - y; 
    } else {
      y += moveAmount;
    }
  }
}
function decreaseX() {
  console.log('X = ' + x);
  if (x > 0) {
    if (x < moveAmount) {
      x -= x;
    } else {
      x -= moveAmount;
    }
  }
}
function increaseX() {
  console.log('X = ' + x);
  if (x < width) {
    if (x > width - moveAmount) {
      x += width - x;
    } else {
      x += moveAmount;
    }
  }
}

// Key handler
function handleKey(e) {
  if (e.key.includes('Arrow')) {
    e.preventDefault();
    draw({ key: e.key });
  }
}

window.addEventListener('keydown', handleKey);


// Knob rotation and functionality
function calculateDegree(e) {

	const target = e.target;

  lastPos = pos360;
	
  // Get knob centers
	var x1 = target.offsetLeft + target.offsetWidth / 2;
	var y1 = target.offsetTop + target.offsetHeight / 2;

	const x2 = e.pageX;
	const y2 = e.pageY;

	const deltaX = x1 - x2;
	const deltaY = y1 - y2;

	rad = Math.atan2(deltaY, deltaX);

	deg = rad * (180 / Math.PI);	

  pos360 = Math.floor(deg - 90);

	if (deg >= -180 && deg <= 90) {
		pos360 += 360;
	}
  
	return deg;
}

function rotate(e) {

	const target = e.target;

	const result = Math.floor(calculateDegree(e) - 90);

	if (target.matches('#knob1')) {
    if (lastPos !== pos360){
      if (pos360 > lastPos) {
        console.log(`x increasing`)
        increaseX();
        draw({ key: null });
      } else {
        console.log(`x decreasing`)
        decreaseX();
        draw({ key: null });
      }
    }
	}

	if (target.matches('#knob2')) {
    if (lastPos !== pos360){
      if (pos360 > lastPos) {
        increaseY();
        draw({ key: null });
      } else {
        decreaseY();
        draw({ key: null });
      }
    }
	}

  target.style.transform = `rotate(${result}deg)`;
}

// Handle mouse down events
function handleMouseDown(e) {

  const target = e.target;

	if (target.matches('.knob')) {
		target.addEventListener('mousemove', rotate);
		target.addEventListener('mouseout', handleMouseOut);
		target.addEventListener('mouseup', handleMouseUp);
	}
}

// Handle mouse leave events
function handleMouseOut(e) {
 
	const target = e.target;

	if (target.matches('.knob')) {
		document.addEventListener('mouseup', () => {
			target.removeEventListener('mousemove', rotate);
			target.removeEventListener('mouseout', handleMouseOut);
		});
	}

}

// Handle mouse up events
function handleMouseUp(e) {

	const target = e.target;

	if (target.matches('.knob')) {
		target.removeEventListener('mousemove', rotate);
		target.removeEventListener('mouseleave', handleMouseOut);
  	target.removeEventListener('mouseup', handleMouseUp);
  } 
}

// Listen for mousedown
knobsContainer.addEventListener('mousedown', handleMouseDown);

/*
// TO DO
*/

/*
- Moving backward through a line you've already drawn on displays lightened cursor
- Shake button
*/