import Bowser from 'bowser';
import Reqwest from 'reqwest';
import {WebGLRenderer, Scene, PerspectiveCamera, MeshPhongMaterial, Mesh, PlaneGeometry, PointLight, AmbientLight, PointLightHelper, TextureLoader} from 'three';

const initializeCanvas = ({width, height, image, elevations}) => {
  const scene = new Scene({autoUpdate: false});
  const canvas = document.getElementById('canvas');
  const aspectRatio = canvas.offsetWidth / canvas.offsetHeight;
  const camera = new PerspectiveCamera(62 / aspectRatio, aspectRatio, 0.1, 1000);
  camera.position.y = 0;
  camera.position.x = 0;
  camera.position.z = 400;

  const renderer = new WebGLRenderer({canvas, alpha: true});
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  const geometry = new PlaneGeometry(200, 200, width - 1, height - 1);
  const material = new MeshPhongMaterial({map: image});
  const plane = new Mesh(geometry, material);

  plane.geometry.vertices.map((v, i) => {
    return Object.assign(v, { z: elevations[i] / 200 })
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

Reqwest("/data/crater-lake-capitol-reef.json", (response) => {
  loader.load("/data/crater-lake-capitol-reef.jpg", (image) => {
    const w = Math.sqrt(response.length);
    initializeCanvas({elevations: response, width: w, height: w, image});
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
