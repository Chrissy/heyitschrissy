import Bowser from 'bowser';
import Reqwest from 'reqwest';

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
