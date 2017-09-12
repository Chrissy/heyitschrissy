import {WebGLRenderer, Scene, PerspectiveCamera, MeshBasicMaterial, Mesh, PlaneGeometry, TextureLoader} from 'three';
import guideJson from '../sketches.json';
import shuffle from 'array-shuffle';

const drawTerrain = ({mesh, image, elevations}, cb) => {
  mesh.geometry.vertices.map((v, i) => Object.assign(v, {z: elevations[i] / 100}));
  mesh.geometry.verticesNeedUpdate = true;

  new TextureLoader().load(image, (img) => {
    mesh.material.map = img;
    mesh.material.needsUpdate = true;
    cb();
  });
}

const initializeMesh = (canvas) => {
  const size = Math.min(Math.max(canvas.offsetWidth, 550), 700);
  const camera = new PerspectiveCamera(42, 1, 0.1, 1000);
  const renderer = new WebGLRenderer({canvas, alpha: true});
  const scene = new Scene({autoUpdate: false});
  const geometry = new PlaneGeometry(200, 200, 100 - 1, 100 - 1);
  const material = new MeshBasicMaterial();
  const mesh = new Mesh(geometry, material);

  const animate = (z = 3.75, x = 5.6) => {
    mesh.rotation.z = z;
    mesh.rotation.x = x;
    renderer.render(scene, camera);
    window.requestAnimationFrame(() => animate(z + 0.0005, x + 0.00005));
  }

  camera.position.z = 400;
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  renderer.setSize(size, size);
  renderer.setClearColor(0xe3f7ff,0);

  animate()
  scene.add(mesh);

  return mesh;
}

const getSketch = (name, cb) => {
  return fetch("https://s3-us-west-2.amazonaws.com/chrissy-portfolio-images/" + name + ".json").then(r => r.json());
};

const requestImageSet = ({elementId}) => {
  const el = document.getElementById(elementId);
  fetch(el.getAttribute('src')).then(r => r.text()).then((html) => {
    el.innerHTML = html;
    el.classList.add('loaded');
  });

  const potentialNextSet = el.getAttribute('next-set');
  if (potentialNextSet) requestImageSet({elementId: potentialNextSet});
}

const handleToggleButtonClick = (toggleButton) => {
  toggleButton.getAttribute("show").split(",").forEach(t => document.getElementById(t).classList.add('showing'));
  toggleButton.getAttribute("hide").split(",").forEach(t => document.getElementById(t).classList.remove('showing'));
  document.body.classList.add('animating');

  const transitionEnd = () => {
    if (toggleButton.getAttribute("shouldLoadImages")) requestImageSet({elementId: "image-set-1"});
    document.body.classList.remove('animating');
    document.body.removeEventListener("transitionend", transitionEnd);
  }

  document.body.addEventListener("transitionend", transitionEnd);
}

document.addEventListener("DOMContentLoaded", function() {
  document.body.classList.remove("no-js");

  const guide = shuffle(guideJson);
  const canvas = document.getElementById("canvas");
  const control = document.getElementById("canvas-control")
  const toggleButtons = document.querySelectorAll('[show],[hide]');
  const sketchTitle = document.getElementById('sketch-title');

  let sketchStore = [getSketch(guide[0].name)];
  let counter = 0;

  const showSketch = () => {
    sketchStore[counter % guide.length].then((response) => {
      drawTerrain({mesh, ...response}, () => document.body.classList.add("sketch-loaded"));
      sketchTitle.innerText = guide[counter % guide.length].humanName;
      counter++;
      if (guide[counter]) sketchStore = [...sketchStore, getSketch(guide[counter].name)];
    });
  }

  if (toggleButtons) [...toggleButtons].forEach((toggleButton) => {
    toggleButton.addEventListener('click', () => handleToggleButtonClick(toggleButton));
  });

  const mesh = initializeMesh(canvas);
  [canvas, control].forEach(c => c.addEventListener('click', showSketch));
  showSketch()
});
