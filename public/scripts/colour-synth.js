class Knob {
  static #lastID = 0;
  id;

  constructor(element) {
    // Variables
    this.id = ++Knob.#lastID;
    this.element = element;
    this.active = false;
    this.startAngle = 0;
    this.angle = 0;
    this.rotation = 0;

    // Methods
    this.create();
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
  }

  handleMouseDown(e) {
    e.preventDefault();

    // Get bound event handler functions
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);

    // Add event listeners to handle mouse movement and mouse up
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    
    // Get bounding box
    let box = this.element.getBoundingClientRect();

    // Get box center
    this.boxCenter = {
      x: box.left + (box.width / 2),
      y: box.top + (box.height / 2)
    }

    // Get deltas
    let dx = e.clientX - this.boxCenter.x,
        dy = e.clientY - this.boxCenter.y;

    // Get starting angle
    this.startAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Set active
    this.active = true;
  }

  handleMouseMove(e) {
    e.preventDefault();
    if (this.active === true) this.rotate(e);
  }

  handleMouseUp(e) {
    e.preventDefault();

    // Stop rotating
    this.stop(e);

    // Remove the event listeners
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  create() { 
    // Add class instance to knobs array
    knobs.push(this);
  }

  rotate(e) {
    e.preventDefault();

    // Get deltas
    let dx = e.clientX - this.boxCenter.x,
        dy = e.clientY - this.boxCenter.y;
    
    // Get degrees
    let deg = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Get rotation amount
    this.rotation = deg - this.startAngle;

    // Get degree between 0 and 359
    let deg360 = Math.floor((this.angle + this.rotation).mod(360));

    // Rotate knob element
    this.element.style.transform = `rotate(${deg360}deg)`;

    this.updateOutputs();

    this.updateKnobs();
    this.updateDisplays();
    this.updateColourField();
  }

  stop(e) {
    e.preventDefault();

    this.angle += this.rotation;
    this.active = false;
  }

  updateKnobs() {

  }

  updateDisplay() {

  }

  updateOutputs() {
    // Get output elements
    const hexOutput = document.querySelector('#hex-output');
    const hslOutput = document.querySelector('#hsl-output');
    const rgbOutput = document.querySelector('#rgb-output');
    const cmykOutput = document.querySelector('#cmyk-output');

    if (this.element.parentNode.id === 'hsl-output') {
      hexOutput = hslToHex(hslOutputValue);
      rgbOutput = hslToRGB(hslOutputValue);
      cmykOutput = hslToCMYK(hslOutputValue);
    }

    if (this.element.parentNode.id === 'rgb-output') {
      hexOutput.textContent = rgbToHex(rgbOutputValue);
      hslOutput.textContent = rgbToHSL(rgbOutputValue);
      cmykOutput.textContent = rgbToCMYK(rgbOutputValue);
    }

    if (this.element.parentNode.id === 'cmyk-output') {
      hexOutput.textContent = cmykToHex(cmykOutputValue);
      hslOutput.textContent = cmykToHSL(cmykOutputValue);
      rgbOutput.textContent = cmykToRGB(cmykOutputValue);
    }

  }

  updateColourField() {

  }
}

class Palette {
  static #lastID = 0;
  static maxSwatches = 9;
  id;

  constructor() {
    this.id = `palette-${++Palette.#lastID}`;
    this.swatches = [];
    this.update();
    this.create();
    this.render();
    this.element = this.getElement();
    this.setActive();
  }

  setActive() {
    // Disable/hide other palettes
    palettes.forEach((palette) => {
      if (palette == this) return;
      palette.element.classList.add('hidden');
    });

    this.element.classList.remove('hidden');
    activePalette = this;
  }

  create() {
    palettes.push(this);
  }

  delete() {
    // Prevent deleting last palette
    if (palettes.length == 1) return;

    // Set next palette as active, or previous palette if we are on the final one
    const next = palettes[palettes.indexOf(this) + 1] ? palettes[palettes.indexOf(this) + 1].setActive() : palettes[palettes.indexOf(this) - 1].setActive();

    // Destroy the DOM element and object instance
    this.element.remove();
    palettes.splice(palettes.indexOf(this), 1);
  }

  next() {
    const nextPalette = palettes[palettes.indexOf(this) + 1] || palettes[0];
    nextPalette.setActive();
  }

  previous() {
    const previousPalette = palettes[palettes.indexOf(this) - 1] || palettes[palettes.length - 1];
    previousPalette.setActive();
  }

  render() {
    const palette = document.createElement('div');
    palette.classList.add('palette');
    palette.setAttribute('id', this.id);
    
    const paletteContainer = document.querySelector('.palette-container');
    paletteContainer.appendChild(palette);
  }

  update() {
    // Set palette title
    //const titleElement = document.querySelector('.palette-title');
    //titleElement.textContent = `Palette ${this.id.replace('palette-', '')}`;
  }

  initSwatches() {
    // Fill the palette up with blank swatches
    while (this.swatches.length < Palette.maxSwatches) {
      // Color defaults to 'transparent' when unspecified
      this.addSwatch(this.id, false);
    }
  }

  addSwatch(paletteId, status, color = 'transparent') {
    this.swatches.push(new Swatch(paletteId, status, color));
  }

  getElement() {
    const palette = document.querySelector(`#${this.id}`);
    return palette;
  }
}

class Swatch {
  static #lastID = 0; // shared across all instances
  id;

  constructor(paletteID, status, color) {
    this.id = `swatch-${++Swatch.#lastID}`;
    this.paletteID = paletteID;
    this.color = color;
    this.status = status;
    this.render(this.paletteID);
    this.element = this.getElement();
    this.palette = this.getPaletteElement();
  }

  set(target) {
    // Set swatch background as page background,+ update local storage
    this.color = body.style.backgroundColor || initialColor;

    // Toggle status 
    this.status = true;
    
    target.style.backgroundColor = this.color;
    this.setLocalStorage();
  }

  clear(target) {
    // Clear: If swatch background matches page background, clear swatch (set swatch background to 'lightgrey', toggle status) + update local storage
    this.color = 'lightgrey';
    this.status = false;

    target.style.backgroundColor = this.color;
    this.setLocalStorage();
  }

  apply(target) {
    // Apply: If status is true, AND the page background is different from this, apply this color to the page background and update all values/visuals
    
    // Store swatch colour in variable
    let newColor = target.style.backgroundColor;

    // Update values
    this.update(newColor);

    // Change background
    body.style.backgroundColor = newColor;
  }

  render(paletteID) {
    const swatch = document.createElement('div');
    swatch.classList.add('swatch');
    swatch.setAttribute('id', this.id);
    swatch.style.backgroundColor = this.color;

    const palette = document.querySelector(`#${paletteID}`);
    palette.appendChild(swatch);
  }
  
  update(color) {
    
     // Get array of integers from RGB string
     let r, g, b; 
     [r, g, b] = getRGB(color);
 
     // Update global value of Red, Green, and Blue
     setRGB(r, g, b);
 
     // Update output values
     rgbOutputValue = `rgb(${red}, ${green}, ${blue})`;
     rgbOutput.textContent = rgbOutputValue;
 
     hexOutputValue = rgbToHex(red, green, blue);
     hexOutput.textContent = hexOutputValue;
 
     hslOutputValue = rgbToHSL(red, green, blue);
     hslOutput.textContent = hslOutputValue;
 
     cmykOutputValue = rgbToCMYK(red, green, blue);
     cmykOutput.textContent = cmykOutputValue;
 
     // Update elements
     updateElements();
  }

  getElement() {
    const swatch = document.querySelector(`#${this.id}`);
    return swatch;
  }

  getPaletteElement() {
    const palette = this.element.parentNode;
    return palette;
  }

  setLocalStorage() {
    localStorage.setItem("palettes", JSON.stringify(palettes));
  }
}



/*
// GLOBAL VARIABLES
*/

// Knobs array
const knobs = [];

// Palettes array
const palettes = [];
let activePalette = {};


/*
// GLOBAL FUNCTIONS
*/

// Handle negative integer modulo operations
Number.prototype.mod = function(n) {
  return ((this % n) + n) % n;
}

// Init program function
function init() { 
  // Init knobs
  const knobElements = document.querySelectorAll('.knob');
  knobElements.forEach((element) => {
    const knob = new Knob(element);
  });

  // Init or set palette if they exist in local storage
  const paletteStorage = localStorage.getItem("palettes");
  if (paletteStorage) 
    setPalettes(JSON.parse(paletteStorage));
  else 
    initPalettes();
}

// Init palette function
function initPalettes() {
  // Add an initial palette of blank swatches
  palettes[0] = new Palette();
  palettes[0].initSwatches();
}

// Set palettes instead of init if they exist in local storage
function setPalettes(paletteStorage) {
  // Fill the palettes array from the info gathered from local storage
  paletteStorage.forEach((palette, i) => {
    palettes[i] = new Palette();
    palette.swatches.forEach((swatch, j) => {
      palettes[i].swatches[j] = new Swatch(palettes[i].id, swatch.status, swatch.color);
    });
  });
}

init();