function handleClick(e) {
  const target = e.target;
  const imageElement = document.querySelector('.project-spotlight--image');
  const button = document.querySelector('#project-browser_view-button');

  if (target.matches('.project-menu--item')) {
    let items = document.querySelectorAll('.project-menu--item');
    
    items.forEach((item) => {
      item.classList.remove('active'); 
    })
  
    target.classList.add('active');
  
  
    if (target.innerText == 'Colour Picker') {
      imageElement.src = '/images/colour-picker.png';
      button.href = '/projects/colour-picker'
    }
  
    if (target.innerText == 'PAINT!') {
      imageElement.src = '/images/paint.png';
      button.href = '/projects/paint';
    }
  
    if (target.innerText == 'Blockbreaker') {
      imageElement.src = '/images/blockbreaker.png';
      button.href = '/projects/blockbreaker'
    }
  
    if (target.innerText == 'Etch-a-Sketch') {
      imageElement.src = '/images/etch-a-sketch.png';
      button.href = '/projects/etch-a-sketch'
    }
  
    if (target.innerText == "Glorf's Quest") {
      imageElement.src = '/images/glorf.png';
      button.href = '/projects/glorfs-quest';
    }
  
    if (target.innerText == "Sandbox") {
      imageElement.src = '/images/sandbox.png';
      button.href = '/projects/sandbox';
    }
  
  }
}

function handleMouseOver(e) {
  const target = e.target;
  const imageElement = document.querySelector('.project-spotlight--image');

  if (target.matches('.project-menu--item')) {
    let items = document.querySelectorAll('.project-menu--item');
    
    items.forEach((item) => {
      item.classList.remove('active'); 
    })
  
    target.classList.add('active');
  
    if (target.innerText == 'Colour Picker') {
      imageElement.src = '/images/colour-picker.png';
    }
  
    if (target.innerText == 'PAINT!') {
      imageElement.src = '/images/paint.png';
    }
  
    if (target.innerText == 'Blockbreaker') {
      imageElement.src = '/images/blockbreaker.png';
    }
  
    if (target.innerText == 'Etch-a-Sketch') {
      imageElement.src = '/images/etch-a-sketch.png';
    }
  
    if (target.innerText == "Glorf's Quest") {
      imageElement.src = '/images/glorf.png';
    }
  
    if (target.innerText == "Sandbox") {
      imageElement.src = '/images/sandbox.png';
    }
  
  }
}

document.addEventListener('click', handleClick);
document.addEventListener('mouseover', handleMouseOver);