import Bowser from 'bowser';
import Reqwest from 'reqwest';
import GetPixels from 'get-pixels';
import {WebGLRenderer, Scene, PerspectiveCamera, MeshBasicMaterial, Mesh, PlaneGeometry} from 'three';

const initializeCanvas = ({data, width, height, elevations}) => {
  const scene = new Scene({autoUpdate: false});
  const canvas = document.getElementById('canvas');
  const aspectRatio = canvas.offsetWidth / canvas.offsetHeight;
  const oneDimensionalData = data.filter((d,i) => i % 4 == 0);

  const camera = new PerspectiveCamera(52 / aspectRatio, aspectRatio, 0.1, 1000);
  const geometry = new PlaneGeometry(223, 223, width - 1, height - 1);
  camera.position.y = 0;
  camera.position.x = 0;
  camera.position.z = 300;

  const renderer = new WebGLRenderer({canvas});
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  const material = new MeshBasicMaterial({color: 0xdddddd, wireframe: true});
  const plane = new Mesh(geometry, material);

  plane.geometry.vertices.map((v,i) => {
    return Object.assign(v, { z: (oneDimensionalData[i] == 255) ? 0 : elevations[i] / 100 })
  });

  plane.rotation.x = 5.7;

  scene.add(plane);
  renderer.render(scene, camera);
}

const pixels = GetPixels("fonts/h.png", (err, data) => {
  Reqwest("/data/whitney.json", (response) => {
    initializeCanvas({data: data.data, width: data.shape[0], height: data.shape[1], elevations: response.reduce((a,r) => [...a, ...r])});
  });
})

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
