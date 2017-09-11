import Bowser from 'bowser';
import Reqwest from 'reqwest';
import GetPixels from 'get-pixels';
import {WebGLRenderer, Scene, PerspectiveCamera, MeshPhongMaterial, Mesh, PlaneGeometry, PointLight, AmbientLight, PointLightHelper, TextureLoader} from 'three';

const initializeCanvas = ({data, width, height, image, imageWidth, imageHeight, elevations, elevations2}) => {
  const scene = new Scene({autoUpdate: false});
  const canvas = document.getElementById('canvas');
  const aspectRatio = canvas.offsetWidth / canvas.offsetHeight;
  const oneDimensionalData = data.filter((d,i) => i % 4 == 0);
  const camera = new PerspectiveCamera(62 / aspectRatio, aspectRatio, 0.1, 1000);
  const geometry = new PlaneGeometry(200, 200, width - 1, height - 1);
  camera.position.y = 0;
  camera.position.x = 0;
  camera.position.z = 400;

  const renderer = new WebGLRenderer({canvas, alpha: true});
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  const material = new MeshPhongMaterial({map: image});
  const plane = new Mesh(geometry, material);

  plane.geometry.vertices.map((v,i) => {
    const add = (oneDimensionalData[i] == 0) ? elevations[i] - 1000: elevations[i];
    return Object.assign(v, { z: add / 200 })
  });

  plane.rotation.x = 5.6;
  plane.rotation.z = 1.75;

  var lights = [];
	lights[0] = new PointLight( 0xffffff, 0.75, 0 );
	lights[1] = new PointLight( 0xffffff, 0.75, 0 );

	lights[0].position.set( 50, 10, 55 );
	lights[1].position.set( -50, -20, 55 );

	scene.add( lights[ 0 ] );
	scene.add( lights[ 1 ] );
  const light = new AmbientLight(0xffffff, 0.33);
  scene.add(light)
  scene.add(plane);
  renderer.render(scene, camera);
}

const loader = new TextureLoader();

GetPixels("fonts/q.png", (err, data) => {
  Reqwest("/data/capitol-reef.json", (response) => {
    Reqwest("/data/crater-lake.json", (response2) => {
      loader.load("/data/capitol-crater.png", (image) => {
        const w = Math.min(response[0].length, response2[0].length);
        const sliced1 = response.map(p => p.slice(0, w)).slice(0, w);
        const sliced2 = response2.map(p => p.slice(0, w)).slice(0, w);
        initializeCanvas({data: data.data, width: w, height: w, image, imageWidth: data.shape[0], imageHeight: data.shape[1], elevations: sliced1.reduce((a,r) => [...a, ...r]), elevations2: sliced2.reduce((a,r) => [...a, ...r])});
      });
    });
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
