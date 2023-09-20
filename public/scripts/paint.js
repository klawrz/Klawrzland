//
/// Paint!
//

// https://allenhwkim.medium.com/3-steps-to-build-a-color-picker-4badd1e96854

const body = document.body;

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const colorPickerCanvas = document.querySelector('#color-picker-canvas');
const colorPickerCtx = colorPickerCanvas.getContext('2d');
const colorPickerContainer = document.querySelector('#color-picker-container');
const colorPickerCircle = document.querySelector('#color-picker-circle');
const colorPickerText = document.querySelector('#color-picker-text');

const [colorPickerWidth, colorPickerHeight] = [colorPickerContainer.offsetWidth, colorPickerContainer.offsetHeight];
[colorPickerCanvas.width, colorPickerCanvas.height] = [colorPickerWidth, colorPickerHeight];

colorPickerText.innerHTML = '&nbsp;';

let x, y;
let lastX, lastY;

let tool = 'brush';
let color = '#000';
let currentColor = color;
let brushSize = 5;

/*
function resize() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

resize();
*/

drawColors();
colorPickerCanvas.addEventListener('click', e => pickColor(e, colorPickerCanvas, colorPickerCircle, colorPickerText));

function pickColor(e, colorPickerCanvas, colorPickerCircle) {
  const rect = e.target.getBoundingClientRect();
  const colorPickerX = e.clientX - rect.left; //x position within the element.
  const colorPickerY = e.clientY - rect.top;  //y position within the element.

  const imgData = colorPickerCtx.getImageData(colorPickerX, colorPickerY, 1, 1);
  const [r, g, b] = imgData.data;
  const [h, s, l] = rgb2hsl(r, g, b);
  const txtColor = l < 0.5 ? '#FFF' : '#000';

  colorPickerCircle.style.top = (colorPickerY - 6) + 'px';
  colorPickerCircle.style.left = (colorPickerX - 6) + 'px';
  colorPickerCircle.style.borderColor = txtColor;

  colorPickerText.innerText = Object.values(toCss(r,g,b,h,s,l))
    .toString().replace(/\)\,/g, ') ');
  colorPickerText.style.backgroundColor = toCss(r,g,b,h,s,l).hex;
  colorPickerText.style.color = txtColor;
  
  currentColor = toCss(r,g,b,h,s,l).rgb;

  let colorToolIcon = document.querySelector('#colorToolIcon');
  colorToolIcon.style.fill = currentColor;

  let brushTip = document.querySelector('.brush-tip');
  brushTip.style.fill = currentColor;

  colorPickerCanvas.dispatchEvent(new CustomEvent('color-selected', {
    bubbles: true,  detail: {r, g, b, h, s, l} 
  }));
}

function drawColors() {

  //Colors - horizontal gradient
  const gradientH = colorPickerCtx.createLinearGradient(0, 0, colorPickerWidth, 0);
  gradientH.addColorStop(0, "rgb(255, 0, 0)"); // red
  gradientH.addColorStop(1/6, "rgb(255, 255, 0)"); // yellow
  gradientH.addColorStop(2/6, "rgb(0, 255, 0)"); // green
  gradientH.addColorStop(3/6, "rgb(0, 255, 255)");
  gradientH.addColorStop(4/6, "rgb(0, 0, 255)"); // blue
  gradientH.addColorStop(5/6, "rgb(255, 0, 255)");
  gradientH.addColorStop(1, "rgb(255, 0, 0)"); // red
  colorPickerCtx.fillStyle = gradientH;
  colorPickerCtx.fillRect(0, 0, colorPickerWidth, colorPickerHeight);
  
  //Shades - vertical gradient
  const gradientV = colorPickerCtx.createLinearGradient(0, 0, 0, colorPickerHeight);
  gradientV.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradientV.addColorStop(0.5, "rgba(255, 255, 255, 0)");
  gradientV.addColorStop(0.5, "rgba(0, 0, 0, 0)");
  gradientV.addColorStop(1, "rgba(0, 0, 0, 1)");
  colorPickerCtx.fillStyle = gradientV;
  colorPickerCtx.fillRect(0, 0, colorPickerWidth, colorPickerHeight);
}

function rgb2hsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function toCss(r, g, b, h, s, l) {
  const int2hex = num => 
    (Math.round(num) < 16 ? '0' : '') + Math.round(num).toString(16);

  return {
    rgb: `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`,
    hsl: `hsl(${Math.round(360 * h)},${Math.round(100 * s)}%,${Math.round(100 * l)}%)`,
    hex: `#${int2hex(r)}${int2hex(g)}${int2hex(b)}`
  };
}

function draw(e) {

  reposition(e);

  ctx.lineWidth = brushSize;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (tool == 'eraser')
    ctx.strokeStyle = '#fff';
  else 
    ctx.strokeStyle = currentColor;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

}

function fill(e) {
  ctx.fillStyle = currentColor;

  reposition(e);

  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let pixelStack = [[x, y]];

  while (pixelStack.length) {
    newPos = pixelStack.pop();
    x = newPos[0];
    y = newPos[1];
  }


}

function reposition(e) {
  lastX = x;
  lastY = y;
  x = e.offsetX;
  y = e.offsetY;
}

function changeTool() {
  
}

function handleMouseEnter(e) {
  const target = e.target;

  if (target.matches('#canvas')) {
    x = e.offsetX;
    y = e.offsetY;

    let selected = document.querySelector('.selected');
    if (selected.firstElementChild.matches('#tool-paintbrush')) canvas.style.cursor = `url('/assets/paintbrush.svg'), default`;
    if (selected.firstElementChild.matches('#tool-paintbucket')) canvas.style.cursor = `url('/assets/paintbucket.svg'), default`;
    if (selected.firstElementChild.matches('#tool-eraser')) canvas.style.cursor = `url('/assets/eraser.svg'), default`;
  }
}

function handleMouseLeave(e) {
	const target = e.target;

	if (target.matches('#canvas')) {
    canvas.style.cursor = `default`;
		document.addEventListener('mouseup', () => {
			target.removeEventListener('mousemove', draw);
		}, {once: true});
	}
}

function handleMouseUp(e) {
  const target = e.target;

  if (target.matches('#canvas')) {
    target.removeEventListener('mousemove', draw);
    target.removeEventListener('mouseup', handleMouseUp);
  }
}


function handleMouseDown(e) {
  const target = e.target;

  e.preventDefault;

  if (target.matches('#canvas')) {

    x = e.offsetX;
    y = e.offsetY;

    target.addEventListener('mousemove', draw);
    target.addEventListener('mouseup', handleMouseUp);
  }
}

function handleClick(e) {
  const target = e.target;
  
  if (target.matches('.toolbar-item') && !target.matches('.selected')) {
    if (!target.matches('.selector')) {

      let selected = document.querySelector('.toolbar-item.selected');
      selected.classList.remove('selected');
      target.classList.add('selected');

      if (target.firstElementChild.matches('#tool-paintbrush')) tool = 'brush';
      if (target.firstElementChild.matches('#tool-paintbucket')) tool = 'bucket';
      if (target.firstElementChild.matches('#tool-eraser')) tool = 'eraser';
    } 
  }

  if (target.matches('.toolbar-submenu li')) {
    let selected = document.querySelector('.toolbar-submenu .selected');
    selected.classList.remove('selected');
    target.classList.add('selected');
  }

  if (target.matches('#brush-size-1')) {
    brushSize = 1;
    const sizeElement = document.querySelector('#tool-size');
    sizeElement.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="${brushSize + 2}" /></svg>`
  }

  if (target.matches('#brush-size-2')) {
    brushSize = 5;
    const sizeElement = document.querySelector('#tool-size');
    sizeElement.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="${brushSize}" /></svg>`
  }

  if (target.matches('#brush-size-3')) {
    brushSize = 10;
    const sizeElement = document.querySelector('#tool-size');
    sizeElement.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="${brushSize}" /></svg>`
  }

  if (target.matches('#brush-size-4')) {
    brushSize = 20;
    const sizeElement = document.querySelector('#tool-size');
    sizeElement.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="${brushSize}" /></svg>`
  }

  if (target.matches('#brush-size-5')) {
    brushSize = 30;
    const sizeElement = document.querySelector('#tool-size');
    sizeElement.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="${brushSize}" /></svg>`
  }

  if (target.matches('#canvas')) {
    if (tool == 'brush' || tool == 'eraser') draw(e);
    if (tool == 'bucket') fill(e);
  }
}

body.addEventListener('mousedown', handleMouseDown);
body.addEventListener('click', handleClick);
canvas.addEventListener('mouseenter', handleMouseEnter);
canvas.addEventListener('mouseleave', handleMouseLeave);