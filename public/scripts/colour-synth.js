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
    this.knobColors = [
      null, 'gray', 'white',
      'red', 'green', 'blue',
      'cyan', 'magenta', 'yellow', 'black'
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
    if (target.matches('#new-palette')) this.newPalette();
    
    // Delete palette
    if (target.matches('#delete-palette')) this.deletePalette();
  
    // Previous palette
    if (target.matches('#previous-palette')) this.previousPalette();
    
    // Next palette
    if (target.matches('#next-palette')) this.nextPalette();
  
    // Handle swatch clicks
    if (target.matches('.swatch')) this.handleSwatch(e);

    // Handle mode button clicks
    if (target.matches('.mode-button')) this.handleModeButton(e);
  }

  handleSwatch(e) {
    const target = e.target;

    const id = Array.from(target.parentNode.children).indexOf(target);
    const swatch = this.activePalette.swatches[id];

    const activeColor = JSON.stringify(colourSynth.rgb);
    let swatchColor = swatch.rgb ? JSON.stringify(swatch.rgb) : null;

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

  newPalette() {
    let palette = new Palette();
    palette.initSwatches();
  }

  deletePalette() {
    this.activePalette.delete();
    this.activePalette.update();
  }

  previousPalette() {
    this.activePalette.previous();
    this.activePalette.update();
  }

  nextPalette() {
    this.activePalette.next();
    this.activePalette.update();
  }

  update(updatedFamily) {
    // Convert other families
    this.updateOtherFamilies(updatedFamily);

    console.log(this.rgb, this.hsl, this.cmyk)

    // Update outputs
    this.updateOutputs();

    // Update knob values, positions, and displays
    this.updateKnobValues();

    // Update the colourfield
    this.updateColorField();
  }

  updateFamily(updatedFamily) {
    // Update the colourSynth's HSL, RGB or CMYK value. This new value is used for conversions
    const knobs = this.knobs;

    // When rotating a knob in a given family, the other knobs in that family don't change
    if (updatedFamily === 'hsl') {
      this.hsl = [knobs[0].value, knobs[1].value, knobs[2].value];
    } else if (updatedFamily === 'rgb') {
      this.rgb = [knobs[3].value, knobs[4].value, knobs[5].value];
    } else {
      this.cmyk = [knobs[6].value, knobs[7].value, knobs[8].value, knobs[9].value];
    }
  }

  updateOtherFamilies(updatedFamily) {
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
  }

  updateKnobValues() {
    const knobValueMappings = [
      ...this.hsl, // First 3 knobs
      ...this.rgb, // Next 3 knobs
      ...this.cmyk, // Last 4 knobs
    ];
  
    this.knobs.forEach((knob, index) => {
      if (knob.value !== knobValueMappings[index]) {
        knob.value = knobValueMappings[index];
        knob.updatePosition();
        knob.updateDisplay();
      }
    });
  }

  updateOutputs() {
    // Update variables
    const [h, s, l] = this.hsl;
    const [r, g, b] = this.rgb;
    const [c, m, y, k] = this.cmyk;

    // Update output strings
    this.hslOutput = `hsl(${h}, ${s}%, ${l}%)`; 
    this.rgbOutput = `rgb(${r}, ${g}, ${b})`;
    this.cmykOutput = `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
    this.hexOutput = this.hex;
    
    // Update active output
    const type = document.querySelector('#output-type');
    const output = document.querySelector('#output');

    if (this.activeOutput === 'hex') output.textContent = this.hexOutput;
    else if (this.activeOutput === 'HSL') output.textContent = this.hslOutput;
    else if (this.activeOutput === 'RGB') output.textContent = this.rgbOutput;
    else if (this.activeOutput === 'CMYK') output.textContent = this.cmykOutput;
  }

  updateColorField() {
    colorField.style.backgroundColor = `rgb(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]})`;
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
  
  constructor(element, type, color) {
    // Variables
    this.id = ++Knob.#lastID;
    this.element = element;
    this.type = type;
    this.color = color;
    this.active = false;
    this.hovered = false;
    this.startAngle = 0;
    this.startDegrees = -135;
    this.startY = 0;
    this.angle = 0;
    this.rotation = 0;
    this.degrees = -135;
    this.value = 0;
    this.progress = this.type === 'HUE' ? null : element.previousElementSibling.children[0].children[0]; // inner progress bar element
    this.display = this.element.nextElementSibling;
    this.displayValue = false;
    this.family = this.assignFamily();

    // Conditionals
    if (this.type === 'SAT' || this.type === 'BLK') {
      this.startDegrees = 135;
      this.degrees = 135;
      this.value = 100;
    } else if (this.type === 'LIG') {
      this.startDegrees = 0;
      this.degrees = 0;
      this.value = 50;
    }
    
    if (this.type !== 'HUE') this.element.style.transform = `rotate(${this.startDegrees}deg)`;
    
    // Events
    this.element.parentNode.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.element.parentNode.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    
    // Methods
    if (this.progress) this.updateProgressBar();
  }

  handleMouseEnter(e) {
    e.preventDefault();

    colourSynth.hoveredKnob = this;

    if (colourSynth.activeKnob === null) {
      this.hovered = true;
      this.showValue();
    }
  }

  handleMouseLeave(e) {
    e.preventDefault();

    if (!this.active) {
      this.hovered = false; 
      this.showType();
    }

    colourSynth.hoveredKnob = null;
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

    // If there is an active knob, and a hovered knob, but the hovered knob isn't the same as the active knob, show the hovered knob's values and mark hovered true, show the active knob's type and mark hovered as false
    // If there is an active knob, and a hovered knob, and the hovered knob is the same as the active knob, don't stop displaying value, keep hovered marked as true
    // If there is an active knob, but no hovered knob, show active knob type and mark hovered false
    // Then unset the active knob

    if (colourSynth.activeKnob) {
      if (colourSynth.hoveredKnob) {
        if (colourSynth.activeKnob !== colourSynth.hoveredKnob) {
          colourSynth.activeKnob.hovered = false;
          colourSynth.activeKnob.showType();

          colourSynth.hoveredKnob.hovered = true;
          colourSynth.hoveredKnob.showValue();
        }
      } else {
        colourSynth.activeKnob.hovered = false;
        colourSynth.activeKnob.showType();
      }
    }

    // Unset active knob
    colourSynth.activeKnob = null;
    
    /*

    // If we are hovering over a different knob, show it's value
    if (colourSynth.hoveredKnob && colourSynth.hoveredKnob != this) {
      colourSynth.hoveredKnob.showValue();
    }

    // Reset the hovered knob unless we are hovering over a knob
    if (!this.hovered) {
      colourSynth.hoveredKnob = null;
      this.displayValue = false;
      this.showType();
    }
    
    
    this.hovered = false;
    */

  }

  assignFamily() {
    let family = '';

    if (this.type === 'HUE' || this.type === 'SAT' || this.type === 'LIG') family = 'hsl';
    else if (this.type === 'RED' || this.type === 'GRN' || this.type === 'BLU') family = 'rgb';
    else family = 'cmyk';

    return family;
  }

  stop(e) {
    e.preventDefault();
    this.angle += this.rotation;
    this.active = false;
  }

  start(e) {
    e.preventDefault();

    if (this.type === 'HUE') {
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
      
    } else {
      this.startY = e.clientY;
      this.startDegrees = this.degrees;
    }
    
    // Set active
    this.active = true;
  }

  rotate(e) {
    e.preventDefault();

    // Only the Hue knob needs 360 rotation
    if (this.type === 'HUE') {
      // Get deltas
      let dx = e.clientX - this.boxCenter.x,
          dy = e.clientY - this.boxCenter.y;
      
      // Get degrees
      let deg = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Get rotation amount
      this.rotation = deg - this.startAngle;

      // Get degree between 0 and 359
      this.degrees = Math.floor((this.angle + this.rotation).mod(360));

    } else {

      // Other knobs
      const deltaY = this.startY - e.clientY;
    
      // Calculate the number of degrees to move per pixel (adjust as needed)
      const degreesPerPixel = 1;

      this.degrees = this.startDegrees + deltaY * degreesPerPixel;

      // Limit the knob's rotation to -135 to 135 degrees
      this.degrees = Math.max(-135, Math.min(135, this.degrees));
      
      // Move the progress bar
      this.updateProgressBar();
    }
    
    // Rotate knob element
    this.element.style.transform = `rotate(${this.degrees}deg)`;

    // Update knob value
    this.update();
  }

  update() {
    // Update knob value
    this.value = this.type === 'HUE' ? this.degrees : this.degreesToValue(this.degrees);

    
    console.log(this.type, this.value)

    // Update knob display value
    this.updateDisplay();

    // Update colourSynth
    colourSynth.updateFamily(this.family);
    colourSynth.update(this.family);
  }

  updateDisplay() {
    const display = this.element.nextElementSibling;
    const value = display.children[1]
    //console.log(this.type, this.value)
    value.children[0].textContent = this.value;
  }

  updatePosition() {
    if (this === colourSynth.activeKnob) return;
  
    this.degrees = this.valueToDegrees(this.value);
    this.element.style.transform = `rotate(${this.degrees}deg)`;
    if (this.progress) this.updateProgressBar();
  }

  showValue() {
    const type = this.display.children[0];
    const value = this.display.children[1]

    value.children[0].textContent = this.value;

    type.classList.add('hidden');
    value.classList.remove('hidden');
  }

  showType() {
    this.display.children[0].classList.remove('hidden');
    this.display.children[1].classList.add('hidden');
  }

  updateProgressBar() {
    this.progress.style.transform = `rotate(${this.degrees + 135}deg)`;
    let progress = parseInt(this.progress.style.transform.replace('rotate(', '').replace(')', ''));
    let segments = 0;

    if (this.type === 'SAT') {

      // Determine number of border segments
      if (progress <= 90) segments = 3;
      else if (progress >= 91 && progress <= 180) segments = 2;
      else if (progress >= 181) segments = 1;

      // Change border colour to indicate additional segments
      if (segments === 1) {
        this.progress.style.borderTopColor = 'var(--progress-bar)';
        this.progress.style.borderRightColor = 'var(--progress-bar)';
      } else if (segments === 2) {
        this.progress.style.borderTopColor = this.color;
        this.progress.style.borderRightColor = 'var(--progress-bar)';
      } else if (segments === 3) {
        this.progress.style.borderRightColor = this.color;
        this.progress.style.borderTopColor = this.color;
      }

    } else {

      // Determine number of border segments
      if (progress <= 90) segments = 1;
      else if (progress >= 91 && progress <= 180) segments = 2;
      else if (progress >= 181) segments = 3;

      // Change border colour to indicate additional segments
      if (segments === 1) {
        this.progress.style.borderRightColor = 'var(--progress-bar)';
        this.progress.style.borderTopColor = 'var(--progress-bar)';
      } else if (segments === 2) {
        this.progress.style.borderRightColor = this.color;
        this.progress.style.borderTopColor = 'var(--progress-bar)';
      } else if (segments === 3) {
        this.progress.style.borderRightColor = this.color;
        this.progress.style.borderTopColor = this.color;
      }
    }
  }

  degreesToValue(degrees) {
    // Map the range of degrees (-135 to 135) to the range of values (0 to 100)
    const minDegrees = -135;
    const maxDegrees = 135;
    const minValue = 0;
    const maxValue = this.family === 'rgb' ? 255 : 100;

    // Calculate the value using linear mapping
    const value = ((degrees - minDegrees) / (maxDegrees - minDegrees)) * (maxValue - minValue) + minValue;

    // Ensure the value is within the 0 to 100 range
    return Math.min(maxValue, Math.max(minValue, Math.round(value)));
  }

  valueToDegrees(value) {
    let minDegrees = -135;
    let maxDegrees = 135;
    let minValue = 0;
    let maxValue = this.family === 'rgb' ? 255 : 100;
    return ((value - minValue) / (maxValue - minValue)) * (maxDegrees - minDegrees) + minDegrees;
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
      if (palette === this) return;
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
      this.addSwatch(this.id, false, null);
    }
  }

  addSwatch(paletteId, status, color = null) {
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

  constructor(paletteID, status, color = null) {
    this.id = ++Swatch.#lastID;
    this.paletteID = paletteID;
    this.rgb = color;
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
    this.rgb = null;
    this.status = false;

    target.style.backgroundColor = this.rgb;
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
      swatch.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
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

    colourSynth.updateOtherFamilies('rgb');
    colourSynth.update('rgb');
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
    const knob = new Knob(element, colourSynth.knobTypes[index], colourSynth.knobColors[index]);
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



init();