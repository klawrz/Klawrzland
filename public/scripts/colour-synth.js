class ColourSynth {
  constructor() {

    // Variables
    this.element = document.querySelector('#synth');
    this.colorField = document.querySelector('#colorField');
    this.hex = '#000000';
    this.hsl = [0, 0, 0];
    this.rgb = [0, 0, 0];
    this.cmyk = [0, 0, 0, 0];
    this.hexOutput = '#000000';
    this.hslOutput = 'hsl(0, 0%, 0%)';
    this.rgbOutput = 'rgb(0, 0, 0)';
    this.cmykOutput = 'cmyk(0%, 0%, 0%, 0%)';
    this.knobs = [];
    this.knobTypes = [
      'HUE', 'SAT', 'LIG',
      'RED', 'GRN', 'BLU',
      'CYN', 'MAG', 'YEL', 'BLK'
    ];
    this.activeKnob = null;
    this.hoveredKnob = null;
    this.palettes = [];
    this.activePalette = null;
    this.activeOutput = 'hex';

    // Event Listeners
    this.element.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(e) {
    e.preventDefault();
  
    // Check target with each click event
    const target = e.target;
  
    // Create palette
    if (target.matches('#new-palette')) newPalette();
    
    // Delete palette
    if (target.matches('#delete-palette')) deletePalette();
  
    // Previous palette
    if (target.matches('#previous-palette')) previousPalette();
    
    // Next palette
    if (target.matches('#next-palette')) nextPalette();
  
    // Handle swatch clicks
    if (target.matches('.swatch')) this.handleSwatch(e);

    // Handle mode button clicks
    if (target.matches('.mode-button')) this.handleModeButton(e);
  }

  handleSwatch(e) {
    const target = e.target;

    const id = parseInt(target.id.replace('swatch-', '')) % (Palette.maxSwatches + 1);

    const swatch = colourSynth.activePalette.swatches[id-1];

    const activeColor = JSON.stringify(colourSynth.rgb);
    const swatchColor = JSON.stringify(swatch.rgb);

    if (swatch.status) 

      // Clear: If swatch background matches page background, clear swatch (set swatch background to 'lightgrey', toggle status) + update local storage
      if (swatchColor == activeColor) swatch.clear(target);

      // Apply: If status is true, AND the page background is different from this, apply this color to the page background and update all values/visuals
      else swatch.apply(target);

    // Set: If swatch status is false, set swatch background as page background, toggle status + update local storage
    else swatch.set(target);
  }

  handleModeButton(e) {    
    const target = e.target;
    const type = document.querySelector('#output-type');
    const output = document.querySelector('#output');

    document.querySelector('.mode-button.active').classList.remove('active');
    target.classList.add('active');

    if (target.matches('#hex-button')) {
      this.activeOutput = 'Hex';
      type.textContent = 'Hex';
      output.textContent = this.hexOutput;
    }
    if (target.matches('#hsl-button')) {
      this.activeOutput = 'HSL';
      type.textContent = 'HSL';
      output.textContent = this.hslOutput;
    }
    if (target.matches('#rgb-button')) {
      this.activeOutput = 'RGB';
      type.textContent = 'RGB';
      output.textContent = this.rgbOutput;
    }
    if (target.matches('#cmyk-button')) {
      this.activeOutput = 'CMYK';
      type.textContent = 'CMYK';
      output.textContent = this.cmykOutput;
    }
  }

  addKnob(knob) {
    this.knobs.push(knob)
  }

  setActiveKnob(knob) {
    this.activeKnob = knob;
  }

  setActivePalette(palette) {
    this.activePalette = palette;
  }

  updateColorField() {
    colorField.style.backgroundColor = `rgb(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]})`;
  }

  getDegreeFromValue(value) {
    const degree = (value / 256) * 360;
    return degree;
  }

  updateKnobDegrees(updatedFamily) {
    if (updatedFamily === 'hsl') {

      // RGB
      for (let i = 3, j = 0; i <= 5; i++) {
        this.knobs[i].valueDegrees = (this.rgb[j] / 256) * 360;
        this.knobs[i].element.style.transform = `rotate(${this.knobs[i].valueDegrees}deg)`;
      }

      // CMYK
      for (let i = 6, j = 0; i <= 9; i++) {
        this.knobs[i].valueDegrees = (this.cmyk[j] / 101) * 360;
        this.knobs[i].element.style.transform = `rotate(${this.knobs[i].valueDegrees}deg)`;
      }
      
    } else if (updatedFamily === 'cmyk') {

      // RGB
      for (let i = 3, j = 0; i <= 5; i++) {
        this.knobs[i].valueDegrees = (this.rgb[j] / 256) * 360;
        this.knobs[i].element.style.transform = `rotate(${this.knobs[i].valueDegrees}deg)`;
      }
      
      // HSL
      this.knobs[0].valueDegrees = this.hsl[0]; // Hue knob value needs no calculation

      // S and L knob
      for (let i = 1; i <= 2; i++) {
        this.knobs[i].valueDegrees = (this.hsl[i] / 101) * 360;
        this.knobs[i].element.style.transform = `rotate(${this.knobs[i].valueDegrees}deg)`;
      }

    } else {
      
      // HSL
      this.knobs[0].valueDegrees = this.hsl[0]; // Hue knob value needs no calculation
      this.knobs[0].element.style.transform = `rotate(${this.knobs[0].valueDegrees}deg)`;

      // S and L knob
      for (let i = 1; i <= 2; i++) {
        this.knobs[i].valueDegrees = (this.hsl[i] / 101) * 360;
        this.knobs[i].element.style.transform = `rotate(${this.knobs[i].valueDegrees}deg)`;
      }

      // CMYK
      for (let i = 6, j = 0; i <= 9; i++) {
        this.knobs[i].valueDegrees = (this.cmyk[j] / 256) * 360;
        this.knobs[i].element.style.transform = `rotate(${this.knobs[i].valueDegrees}deg)`;
      }

    }
  }

  updateKnobDisplay() {
    this.knobs.forEach((knob) => {
      const newValue = knob.getDisplayValue();
      knob.updateDisplay(newValue);
    });
  }


  updateOutputs(updatedFamily) {
    // Init variables for colours
    let h, s, l, r, g, b, c, m, y, k;
    
    // If we have HSL or CMYK values, convert to RGB before proceeding
    if (updatedFamily === 'hsl') {
      
      // Get HSL values
      [h, s, l] = this.hsl;
      
      // Convert HSL to RGB
      this.rgb = this.toRGB(h, s, l);

      // Get updated RGB values for other conversions
      [r, g, b] = this.rgb;

      // Based on the new RGB value, get CMYK values
      this.cmyk = this.toCMYK(r, g, b);
      
    } else if (updatedFamily === 'cmyk') {
      
      // Get CMYK values
      [c, m, y, k] = this.cmyk;
      
      // Convert CMYK to RGB
      this.rgb = this.toRGB(c, m, y, k);

      // Get updated RGB values for other conversions
      [r, g, b] = this.rgb;

      // Based on the new RGB value, get HSL values
      this.hsl = this.toHSL(r, g, b);
      
    } else {

      // Get updated RGB values for other conversions
      [r, g, b] = this.rgb;

      // Based on the new RGB value, get HSL values
      this.hsl = this.toHSL(r, g, b);
      
      // Based on the new RGB value, get CMYK values
      this.cmyk = this.toCMYK(r, g, b);
    }

    // At this point, RGB values are updated regardless of family. Get new Hex string
    this.hex = this.toHex(r, g, b);

    // Update variables
    [h, s, l] = this.hsl;
    [c, m, y, k] = this.cmyk;

    // Update output strings
    this.hslOutput = `hsl(${h}, ${s}%, ${l}%)`; 
    this.rgbOutput = `rgb(${r}, ${g}, ${b})`;
    this.cmykOutput = `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
    this.hexOutput = this.hex;

    
    // With the outputs updated, we can update the Knob value and position (valueDegrees)
    this.updateKnobDegrees(updatedFamily);
    this.updateKnobDisplay();
    
    // Update active output
    const type = document.querySelector('#output-type');
    const output = document.querySelector('#output');

    if (this.activeOutput === 'hex') output.textContent = this.hexOutput;
    else if (this.activeOutput === 'HSL') output.textContent = this.hslOutput;
    else if (this.activeOutput === 'RGB') output.textContent = this.rgbOutput;
    else if (this.activeOutput === 'CMYK') output.textContent = this.cmykOutput;
  }

  toHex(r, g, b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
  
    if (r.length == 1) {
      r = "0" + r;
    }
    if (g.length == 1) {
      g = "0" + g;
    }
    if (b.length == 1) {
      b = "0" + b;
    }
  
    return `#${r}${g}${b}`;
  }

  toHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0) {
      h = 0;
    } else if (cmax == r) {
      h = ((g - b) / delta) % 6;
    } else if (cmax == g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);

    if (h < 0) {
      h += 360;
    }

    l = (cmax + cmin) / 2;

    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    h = Math.floor(h);
    s = Math.floor(s);
    l = Math.floor(l);

    return [h, s, l];
  }

  toRGB(v1, v2, v3, v4 = null) {
    let r, g, b;

    if (arguments.length === 3) {

      // If only 3 arguments, we have HSL values
      let h = v1;
      let s = v2;
      let l = v3;
      
      // Convert HSL to RGB
      s /= 100;
      l /= 100;

      let c = (1 - Math.abs(2 * l - 1)) * s,
          x = c * (1 - Math.abs((h / 60) % 2 - 1)),
          m = l - c/2;

      if (0 <= h && h < 60) {
        r = c; g = x; b = 0;  
      } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
      } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
      } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
      } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
      } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
      }

      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);

      
    } else { 

      // Otherwise, we have CMYK values
      let c = v1;
      let m = v2;
      let y = v3;
      let k = v4;
      
      // Convert CMYK to RGB
      r = Math.floor(255 * (1 - c / 100) * (1 - k / 100));
      g = Math.floor(255 * (1 - m / 100) * (1 - k / 100));
      b = Math.floor(255 * (1 - y / 100) * (1 - k / 100));
    }

    return [r, g, b];
  }

  toCMYK(r, g, b) {
    let c, m, y, k, max;

    r /= 255;
    g /= 255;
    b /= 255;

    max = Math.max(r, g, b);

    k = 1 - max;

    if (k == 1) {
      c = 0;
      m = 0;
      y = 0;
    } else {
      c = (1 - r - k) / (1 - k);
      m = (1 - g - k) / (1 - k);
      y = (1 - b - k) / (1 - k);
    }

    c = Math.floor(c * 100);
    m = Math.floor(m * 100);
    y = Math.floor(y * 100);
    k = Math.floor(k * 100);

   return [c, m, y, k];
  }

}

class Knob {
  id;
  static #lastID = 0;
  
  constructor(element, type) {
    // Variables
    this.id = ++Knob.#lastID;
    this.element = element;
    this.type = type;
    this.active = false;
    this.hovered = false;
    this.startAngle = 0;
    this.angle = 0;
    this.rotation = 0;
    this.valueDegrees = 0;
    
    // Events
    this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));

    // Methods
    this.family = this.assignFamily();
  }

  handleMouseEnter(e) {
    e.preventDefault();

    colourSynth.hoveredKnob = this;

    if (!this.hovered && !colourSynth.activeKnob) {
      this.hovered = true;
      this.showValue();
    }
  }

  handleMouseLeave(e) {
    e.preventDefault();

    if (!this.active) {
      this.hovered = false; 
      colourSynth.hoveredKnob = null;
      this.showType();
    }
  }

  handleMouseDown(e) {
    e.preventDefault();

    // Get bound event handler functions
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);

    // Add event listeners to handle mouse movement and mouse up
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);

    // Set as the Synth's active knob
    colourSynth.setActiveKnob(this);
    
    // Prepare for rotation
    this.start(e);
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

    // Unset active knob
    colourSynth.activeKnob = null;

    // If we are hovering over a different knob, show it's value
    if (colourSynth.hoveredKnob && colourSynth.hoveredKnob != this) colourSynth.hoveredKnob.showValue();

    // Reset the hovered knob unless we are hovering over a knob
    if (!this.hovered) colourSynth.hoveredKnob = null;

    this.hovered = false;

    // Hide value, show knob type
    this.showType();
  }

  assignFamily() {
    let family = '';

    if (this.type === 'HUE' || this.type === 'SAT' || this.type === 'LIG') family = 'hsl';
    else if (this.type === 'RED' || this.type === 'GRN' || this.type === 'BLU') family = 'rgb';
    else family = 'cmyk';

    return family;
  }

  start(e) {
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
    this.valueDegrees = Math.floor((this.angle + this.rotation).mod(360));

    // Rotate knob element
    this.element.style.transform = `rotate(${this.valueDegrees}deg)`;

    // With an updated value, we can convert to other formats, then reverse calculate the updated knob degrees from the values
    this.updateColourSynthOutputs()
    colourSynth.updateColorField();
  }

  stop(e) {
    e.preventDefault();
    this.angle += this.rotation;
    this.active = false;
  }

  updateColourSynthOutputs() {
    // At this point in rotating, the current knob has an updated value in degrees, and the other knobs in the family have not changed
    if (this.family === 'hsl') {
      // Using the display value, we can convert to other colours and update the global value for those colours
      colourSynth.hsl = [colourSynth.knobs[0].getDisplayValue(), colourSynth.knobs[1].getDisplayValue(), colourSynth.knobs[2].getDisplayValue()];
    } else if (this.family === 'rgb') {
      colourSynth.rgb = [colourSynth.knobs[3].getDisplayValue(), colourSynth.knobs[4].getDisplayValue(), colourSynth.knobs[5].getDisplayValue()];
    } else {
      colourSynth.cmyk = [colourSynth.knobs[6].getDisplayValue(), colourSynth.knobs[7].getDisplayValue(), colourSynth.knobs[8].getDisplayValue(), colourSynth.knobs[9].getDisplayValue()];
    }

    // At this point, one of the colourSynth outputs (HSL, RGB, CMYK) has an updated value
    // We tell colourSynth to update the outputs of the other families by letting it know which family just got updated via knob rotation
    colourSynth.updateOutputs(this.family);
  }

  getDisplayValue() {
    if (this.type === 'HUE') return this.valueDegrees;
    else if (this.type === 'SAT') return Math.floor(100 - (this.valueDegrees / 360) * 100);
    else if (this.type === 'LIG') return Math.floor(((this.valueDegrees + 180) % 360) * (101 / 360));
    else if (this.type === 'RED' || this.type === 'GRN' || this.type === 'BLU') return Math.floor((this.valueDegrees / 360) * 256);
    else return Math.floor((this.valueDegrees / 360) * 101);
  }

  updateDisplay(newValue) {
    const display = this.element.nextElementSibling;
    const value = display.children[1]

    value.children[0].textContent = newValue;
  }

  showValue() {
    const display = this.element.nextElementSibling;
    const type = display.children[0];
    const value = display.children[1]

    value.children[0].textContent = this.getDisplayValue();

    type.classList.add('hidden');
    value.classList.remove('hidden');
  }

  showType() {
    const display = this.element.nextElementSibling;
    display.children[0].classList.remove('hidden');
    display.children[1].classList.add('hidden')
  }

  updateValues() {

    // Set mode, pass it in with the function call
    let mode;

    if (this.type === 'HUE' || this.type === 'SAT' || this.type === 'LIG') mode = 'hsl';
    if (this.type === 'RED' || this.type === 'GRN' || this.type === 'BLU') mode = 'rgb';
    if (this.type === 'CYN' || this.type === 'MAG' || this.type === 'YEL' || this.type === 'BLK') mode = 'cmyk';

    // Update colour values
    colourSynth.updateKnobValues(mode);
  }
}

class Palette {
  static #lastID = 0;
  static maxSwatches = 6;
  id;

  constructor() {
    this.id = ++Palette.#lastID;
    this.swatches = [];
    this.update();
    this.create();
    this.render();
    this.element = this.getElement();
    this.setActive();
  }

  setActive() {
    // Disable/hide other palettes
    colourSynth.palettes.forEach((palette) => {
      if (palette == this) return;
      palette.element.classList.add('hidden');
    });

    this.element.classList.remove('hidden');
    colourSynth.activePalette = this;
  }

  create() {
    colourSynth.palettes.push(this);
  }

  delete() {
    // Prevent deleting last palette
    if (colourSynth.palettes.length == 1) return;

    // Set next palette as active, or previous palette if we are on the final one
    const next = colourSynth.palettes[colourSynth.palettes.indexOf(this) + 1] ? colourSynth.palettes[colourSynth.palettes.indexOf(this) + 1].setActive() : colourSynth.palettes[colourSynth.palettes.indexOf(this) - 1].setActive();

    // Destroy the DOM element and object instance
    this.element.remove();
    colourSynth.palettes.splice(colourSynth.palettes.indexOf(this), 1);
  }

  next() {
    const nextPalette = colourSynth.palettes[colourSynth.palettes.indexOf(this) + 1] || colourSynth.palettes[0];
    nextPalette.setActive();
  }

  previous() {
    const previousPalette = colourSynth.palettes[colourSynth.palettes.indexOf(this) - 1] || colourSynth.palettes[colourSynth.palettes.length - 1];
    previousPalette.setActive();
  }

  render() {
    const palette = document.createElement('div');
    palette.classList.add('palette');
    palette.id = `palette-${this.id}`;
    
    const paletteContainer = document.querySelector('.palette-container');
    paletteContainer.appendChild(palette);
  }

  update() {
    // Set palette title
    const titleElement = document.querySelector('.palette-title');
    titleElement.textContent = `Palette ${this.id}`;
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
    const palette = document.querySelector(`#palette-${this.id}`);
    return palette;
  }
}

class Swatch {
  static #lastID = 0; // shared across all instances
  id;

  constructor(paletteID, status, color) {
    this.id = ++Swatch.#lastID;
    this.paletteID = paletteID;
    this.rgb = null;
    this.status = status;
    this.render(this.paletteID);
    this.element = this.getElement();
    this.palette = this.getPaletteElement();
  }

  set(target) {
    console.log('setting')

    if (this.rgb === null) this.rgb = [];

    // Get colours for swatch
    [this.rgb[0], this.rgb[1], this.rgb[2]] = colourSynth.rgb;

    let [r, g, b] = this.rgb;

    // Toggle status 
    this.status = true;
    
    // Remove '+' sign
    target.classList.remove('empty');
    
    // Set swatch colour
    target.style.backgroundColor = `rgb(${r}, ${g}, ${b})`

    // Update local storage
    this.setLocalStorage();
  }

  clear(target) {
    console.log('cleariong')
    // Clear: If swatch background matches page background, clear swatch (set swatch background to 'null', toggle status) + update local storage
    this.color = null;
    this.status = false;

    target.style.backgroundColor = this.color;
    target.classList.add('empty');
    this.setLocalStorage();
  }

  apply(target) {
    // Apply: If status is true, AND the page background is different from this, apply this color to the page background and update all values/visuals
    
    console.log('applying')
    // Store swatch colour in variable
    let newColor = target.style.backgroundColor;

    // Update values
    this.update(newColor);
  }

  render(paletteID) {
    // Create element
    const swatch = document.createElement('div');
    
    // Add classes
    swatch.classList.add('swatch');
    if (!this.status) swatch.classList.add('empty');

    // Set element ID
    swatch.id = `swatch-${this.id}`;

    // Set background colour
    if (this.rgb) {
      let [r, g, b] = this.rgb;
      swatch.style.backgroundColor = `rgb(${r}, ${g} ${b})`;
    } else {
      swatch.style.backgroundColor = null;
    }

    const palette = document.querySelector(`#palette-${paletteID}`);
    palette.appendChild(swatch);
  }
  
  update(color) {
    let r, g, b;
    
    // Extract integers from swatch RGB value
    const matches = color.match(/(\d+)/g);

    if (matches && matches.length === 3) {
      r = parseInt(matches[0], 10);
      g = parseInt(matches[1], 10);
      b = parseInt(matches[2], 10);
    }
 
    // Update colour synth rgb value
    colourSynth.rgb = [r, g, b];

    colourSynth.updateOutputs('rgb');
    colourSynth.updateColorField();
  }

  getElement() {
    const swatch = document.querySelector(`#swatch-${this.id}`);
    return swatch;
  }

  getPaletteElement() {
    const palette = this.element.parentNode;
    return palette;
  }

  setLocalStorage() {
    localStorage.setItem("palettes", JSON.stringify(colourSynth.palettes));
  }
}



/*
// GLOBAL SELECTORS
*/






/*
// GLOBAL VARIABLES
*/

// Init ColourSynth
const colourSynth = new ColourSynth();


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
  knobElements.forEach((element, index) => {
    const knob = new Knob(element, colourSynth.knobTypes[index]);
    colourSynth.knobs.push(knob);
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
  colourSynth.palettes[0] = new Palette();
  colourSynth.palettes[0].initSwatches();
}

// Set palettes instead of init if they exist in local storage
function setPalettes(paletteStorage) {

  // Fill the palettes array from the info gathered from local storage
  paletteStorage.forEach((palette, i) => {
    colourSynth.palettes[i] = new Palette();
    palette.swatches.forEach((swatch, j) => {
      colourSynth.palettes[i].swatches[j] = new Swatch(colourSynth.palettes[i].id, swatch.status, swatch.rgb);
    });
  });
}

// Palette control functions
function newPalette() {
  let palette = new Palette();
  palette.initSwatches();
}
function deletePalette() {
  colourSynth.activePalette.delete();
  colourSynth.activePalette.update();
}
function previousPalette() {
  colourSynth.activePalette.previous();
  colourSynth.activePalette.update();
}
function nextPalette() {
  colourSynth.activePalette.next();
  colourSynth.activePalette.update();
}

init();