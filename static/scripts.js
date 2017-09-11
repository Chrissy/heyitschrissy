import Bowser from 'bowser';
import {WebGLRenderer, Scene, PerspectiveCamera, MeshBasicMaterial, Mesh, PlaneGeometry, TextureLoader} from 'three';
import guide from '../script/guide.json';

const initializeCanvas = ({canvas, width, height, image, elevations}) => {
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

  return canvas;
}

const createTerrainSketch = (canvas, url, cb) => {
  fetch(url).then(r => r.json()).then((response) => {
    new TextureLoader().load(response.image, (image) => {
      const w = Math.sqrt(response.elevations.length);
      cb(initializeCanvas({canvas, elevations: response.elevations, width: w, height: w, image}));
    });
  });
}

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

  const canvas1 = document.getElementById("canvas1");
  const canvas2 = document.getElementById("canvas2");
  [canvas1, canvas2].map(c => c.addEventListener('click', () => {
    [canvas1, canvas2].map(c => c.classList.toggle('next'));
  }))

  const preloadImages = document.querySelectorAll('img.preload');
  const toggleButtons = document.querySelectorAll('.toggle-button');
  const slidingSections = document.querySelectorAll('.sliding-site-section');

  createTerrainSketch(canvas1, "/dist/" + guide[0].name + ".json", () => {
    createTerrainSketch(canvas2, "/dist/" + guide[1].name + ".json", () => {});
  });

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
