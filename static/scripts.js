import Bowser from 'bowser';
import Reqwest from 'reqwest';
import {WebGLRenderer, Scene, PerspectiveCamera, MeshBasicMaterial, Mesh, PlaneGeometry, TextureLoader} from 'three';

const initializeCanvas = ({width, height, image, elevations}) => {
  const canvas = document.getElementById('canvas');
  const camera = new PerspectiveCamera(62, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
  const renderer = new WebGLRenderer({canvas, alpha: true});
  const scene = new Scene({autoUpdate: false});
  const geometry = new PlaneGeometry(200, 200, width - 1, height - 1);
  const material = new MeshBasicMaterial({map: image});
  const plane = new Mesh(geometry, material);

  const spinZ = (z = 3.75, x = 5.6) => {
    plane.rotation.z = z;
    plane.rotation.x = x;
    renderer.render(scene, camera);
    window.requestAnimationFrame(() => spinZ(z + 0.0005, x + 0.00005));
  }

  camera.position.z = 400;
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  plane.geometry.vertices.map((v, i) => Object.assign(v, {z: elevations[i] / 100}));

  spinZ()
  scene.add(plane);
}

Reqwest("/dist/crater-whitney.json", (response) => {
  new TextureLoader().load(response.image, (image) => {
    const w = Math.sqrt(response.elevations.length);
    initializeCanvas({elevations: response.elevations, width: w, height: w, image});
  });
});

const requestImageSet = ({elementId}) => {
  const el = document.getElementById(elementId);
  Reqwest(el.getAttribute('src'), (response) => {
    el.innerHTML = response;
    el.classList.add('loaded');
  });

  const potentialNextSet = el.getAttribute('next-set');
  if (potentialNextSet) requestImageSet({elementId: potentialNextSet});
}

document.addEventListener("DOMContentLoaded", function() {
  if (Bowser.msie) return;
  document.body.classList.remove("no-js");

  const preloadImages = document.querySelectorAll('img.preload');
  const toggleButtons = document.querySelectorAll('.toggle-button');
  const slidingSections = document.querySelectorAll('.sliding-site-section');

  [...toggleButtons].forEach(function(toggleButton){
    toggleButton.addEventListener('click', function(){
      document.body.classList.toggle('showing-second-panel');

      [...slidingSections].forEach(element => element.classList.toggle('showing'));
      [...toggleButtons].forEach(element => element.classList.toggle('showing'));

      document.body.classList.add('animating');

      setTimeout(() => {
        document.body.classList.remove('animating');
        requestImageSet({elementId: "image-set-1"});
      }, 500);
    });
  });
});

window.onunload = () => {
  if (document.body.classList.contains('showing-second-panel')) window.scrollTo(0,0);
}
