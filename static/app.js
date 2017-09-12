import Bowser from 'bowser';
import {WebGLRenderer, Scene, PerspectiveCamera, MeshBasicMaterial, Mesh, PlaneGeometry, TextureLoader} from 'three';
import guideJson from '../script/guide.json';
import shuffle from 'array-shuffle';

const drawTerrain = ({plane, image, elevations}) => {
  plane.geometry.vertices.map((v, i) => Object.assign(v, {z: elevations[i] / 100}));
  plane.geometry.verticesNeedUpdate = true;
  new TextureLoader().load(image, (img) => {
    plane.material.map = img;
    plane.material.needsUpdate = true;
  });
}

const initializeRenderer = ({canvas, image, elevations}) => {
  const width = Math.sqrt(elevations.length);
  const size = Math.min(Math.max(canvas.offsetWidth, 550), 700);
  const camera = new PerspectiveCamera(42, 1, 0.1, 1000);
  const renderer = new WebGLRenderer({canvas, alpha: true});
  const scene = new Scene({autoUpdate: false});
  const geometry = new PlaneGeometry(200, 200, width - 1, width - 1);
  const material = new MeshBasicMaterial();
  const plane = new Mesh(geometry, material);

  const animate = (z = 3.75, x = 5.6) => {
    plane.rotation.z = z;
    plane.rotation.x = x;
    renderer.render(scene, camera);
    window.requestAnimationFrame(() => animate(z + 0.0005, x + 0.00005));
  }

  camera.position.z = 400;
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  renderer.setSize(size, size);

  drawTerrain({plane, image, elevations});
  animate()
  scene.add(plane);

  return {canvas, plane};
}

const getSketch = (name, cb) => fetch("/dist/" + name + ".json").then(r => r.json());

const requestImageSet = ({elementId}) => {
  const el = document.getElementById(elementId);
  fetch(el.getAttribute('src')).then(r => r.text()).then((html) => {
    el.innerHTML = html;
    el.classList.add('loaded');
  });

  const potentialNextSet = el.getAttribute('next-set');
  if (potentialNextSet) requestImageSet({elementId: potentialNextSet});
}

document.addEventListener("DOMContentLoaded", function() {
  if (Bowser.msie) return;
  document.body.classList.remove("no-js");

  const guide = shuffle(guideJson);
  const canvas = document.getElementById("canvas");
  const control = document.getElementById("canvas-control")
  const toggleButtons = document.querySelectorAll('[show],[hide]');
  const sketchTitle = document.getElementById('sketch-title');

  const showNextSketch = (renderer) => {
    sketches[sketches.length - 1].then((response) => {
      if (guide[sketches.length]) {
        sketches.push(getSketch(guide[sketches.length].name));
      } else {
        sketches = sketches.slice(0, 1)
      }
      drawTerrain({plane: renderer.plane, image: response.image, elevations: response.elevations});
      sketchTitle.innerText = guide[sketches.length - 1].humanName;
    });
  }

  const initializeSketchControls = (renderer) => {
    sketchTitle.innerText = guide[0].humanName;
    [canvas, control].forEach(c => c.addEventListener('click', () => showNextSketch(renderer)));
  }

  let sketches = guide.slice(0,2).map(s => getSketch(s.name));

  sketches[0].then((response) => {
    const renderer = initializeRenderer({canvas, image: response.image, elevations: response.elevations});
    initializeSketchControls(renderer);
  });

  if (toggleButtons) toggleButtons.forEach((toggleButton) => {
    toggleButton.addEventListener('click', function(){
      this.getAttribute("show").split(",").forEach(t => document.getElementById(t).classList.add('showing'));
      this.getAttribute("hide").split(",").forEach(t => document.getElementById(t).classList.remove('showing'));

      document.body.classList.add('animating');

      const transitionEnd = () => {
        if (this.getAttribute("shouldLoadImages")) requestImageSet({elementId: "image-set-1"});
        document.body.classList.remove('animating');
        document.body.removeEventListener("transitionend", transitionEnd);
      }

      const removeAnimating = document.body.addEventListener("transitionend", transitionEnd);
    });
  });
});

window.onunload = () => {
  window.scrollTo(0,0);
}
