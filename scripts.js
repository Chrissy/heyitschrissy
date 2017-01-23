document.addEventListener("DOMContentLoaded", function() {
  var leftTrigger = document.getElementById('portfolio-toggle-button');
  var slidingSections = document.querySelectorAll('.sliding-site-section');

  leftTrigger.addEventListener('click', function(){
    slidingSections.forEach(element => element.classList.toggle('showing'))
  });
});
