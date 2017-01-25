document.addEventListener("DOMContentLoaded", function() {
  var toggleButtons = document.querySelectorAll('.toggle-button');
  var slidingSections = document.querySelectorAll('.sliding-site-section');

  toggleButtons.forEach(function(toggleButton){
    toggleButton.addEventListener('click', function(){
      document.body.classList.toggle('showing-second-panel');

      slidingSections.forEach(element => element.classList.toggle('showing'));
      toggleButtons.forEach(element => element.classList.toggle('showing'));

      document.body.classList.add('animating');
      setTimeout(() => document.body.classList.remove('animating'), 500);
    });
  });
});

window.onbeforeunload = function(){
  if (document.body.classList.contains('showing-second-panel')) window.scrollTo(0,0);
}
