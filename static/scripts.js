import Bowser from 'bowser';
import {WebGLRenderer, Scene, PerspectiveCamera, MeshBasicMaterial, Mesh, PlaneGeometry, TextureLoader} from 'three';
import guide from '../script/guide.json';

const drawTerrain = ({plane, image, elevations}) => {
  plane.geometry.vertices.map((v, i) => Object.assign(v, {z: elevations[i] / 100}));
  plane.geometry.verticesNeedUpdate = true;
  new TextureLoader().load(image, (img) => {
    plane.material.map = img;
    plane.material.needsUpdate = true;
  });
}

const initializeCanvas = ({canvas, width, height, image, elevations}) => {
  const size = Math.min(Math.max(canvas.offsetWidth, 600), 800);
  const camera = new PerspectiveCamera(42, 1, 0.1, 1000);
  const renderer = new WebGLRenderer({canvas, alpha: true});
  const scene = new Scene({autoUpdate: false});
  const geometry = new PlaneGeometry(200, 200, width - 1, height - 1);
  const material = new MeshBasicMaterial();
  const plane = new Mesh(geometry, material);

  const spinZ = (z = 3.75, x = 5.6) => {
    plane.rotation.z = z;
    plane.rotation.x = x;
    renderer.render(scene, camera);
    window.requestAnimationFrame(() => spinZ(z + 0.0005, x + 0.00005));
  }

  camera.position.z = 400;
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  renderer.setSize(size, size);

  drawTerrain({plane, image, elevations});
  spinZ()
  scene.add(plane);

  return {canvas, plane};
}

const getSketch = (name, cb) => fetch("/dist/" + name + ".json").then(r => r.json());

const createTerrainSketch = (canvas, response) => {
  const w = Math.sqrt(response.elevations.length);
  return initializeCanvas({canvas, elevations: response.elevations, width: w, height: w, image: response.image});
};

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

  let sketches = [];
  const canvas = document.getElementById("canvas1");
  const preloadImages = document.querySelectorAll('img.preload');
  const toggleButtons = document.querySelectorAll('.toggle-button');
  const slidingSections = document.querySelectorAll('.sliding-site-section');

  guide.slice(0,2).forEach(s => {
    const sketch = getSketch(s.name);
    sketches.push(sketch)
  });

  sketches[0].then((response) => {
    const sketch = createTerrainSketch(canvas, response);

    canvas.addEventListener('click', () => {
      sketches[sketches.length - 1].then((response) => {
        if (guide[sketches.length]) {
          sketches.push(getSketch(guide[sketches.length].name))
        } else { sketches = sketches.slice(0, 1) };
        drawTerrain({plane: sketch.plane, image: response.image, elevations: response.elevations});
      });
    });
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
