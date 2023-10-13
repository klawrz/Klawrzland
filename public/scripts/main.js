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
  
  
    if (target.innerText == 'ColourSynth') {
      imageElement.src = '/images/colourSynth.png';
      button.href = '/projects/colourSynth'
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
  
    if (target.innerText == 'ColourSynth') {
      imageElement.src = '/images/colourSynth.png';
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

class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = this.mainDetailsToggle.querySelector('summary').nextElementSibling;

    this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.animations.forEach((animation) => animation.play());
    } else {
      this.animations.forEach((animation) => animation.cancel());
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
  }
}

customElements.define('details-disclosure', DetailsDisclosure);

class HeaderMenu extends DetailsDisclosure {
  constructor() {
    super();
    this.header = document.querySelector('.header-wrapper');
  }

  onToggle() {
    if (!this.header) return;
    this.header.preventHide = this.mainDetailsToggle.open;

    if (document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') !== '') return;
    document.documentElement.style.setProperty(
      '--header-bottom-position-desktop',
      `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
    );
  }
}

customElements.define('header-menu', HeaderMenu);