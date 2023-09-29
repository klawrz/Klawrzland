TODO

Main:
- Variables for font size
- Variables for spacing
- Revisit font, look into @font-face
- Change sizes to rems, calculate based on variables
- Think about JSON file that holds values for page elements, so that we can modify the json file when we want to make changes
- move svgs into partials
- learn about path element
- review HTML structure: should the rendered pages have their own HTML and Head/Body tags? You can only have one Body tag per document, but the pages are separate files,
  they could be separate documents. What makes a file a document?
- Form label transitions
- Form label clashes with input text when input loses focus
- Prevent scroll past header/footer
- Create own style for knobs
- Project cards for /projects page



Project Browser section
- Section height fluctates when hovering over Glorf's quest




Colour Picker:
- Colour picker layout
- Colour picker output-container min-width is still too small to support max CMYK values
- Little clipboard icon that appears on hover to copy colour instead of inline copy button taking up room
- Fix mouseleave vs mouseout
- Dynamically generate new 3x3 palettes of colour swatches





Etch-A-Sketch: 
- when drawing with a knob, the line pokes out in the wrong direction for a quick second
- Diagonal line if up/down arrow key is detected at the same time as right/left



Sandbox:
- Add a seek funcion for mobs to seek and attack player
- Moving platform
- Damage depends on factors (enemy / gun strength)
- Half hearts, each heart = 1000
- Think about constructor for images - Do we need w and h, or is this pulled from image
- Should introScreen() and other functions be called in an onLoad function?


Paint!:
- Add tap support
- Figure out how to use ejs include to get a file from Assets folder
- 




COMPLETED

Main:
- CSS variables for colours 
- Fix the Footer
- Fix header dropdown
- Set projects up at their corresponding URLs
- Set up remaining grid width classes
- Implement a game time clock to control animation refresh rate
- Set up remaining heading classes

Sandbox:
- Init mobs n such in a function (problem with scope?)


Paint!:
- Problem: We are drawing from one location to the exact same location. One answer: https://dev.to/dailydevtips1/javascript-mouse-drawing-on-the-canvas-16li
- Fix mouseleave
- Add toolbar
- Draw in continuous line, no breaks


Project Browser:
- Remove 'View' button
- Update image on hover-over menu items instead of click
- Clicking menu item links to that page