(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

document.addEventListener("DOMContentLoaded", function () {
  var toggleButtons = document.querySelectorAll('.toggle-button');
  var slidingSections = document.querySelectorAll('.sliding-site-section');

  [].concat(_toConsumableArray(toggleButtons)).forEach(function (toggleButton) {
    toggleButton.addEventListener('click', function () {
      document.body.classList.toggle('showing-second-panel');

      [].concat(_toConsumableArray(slidingSections)).forEach(function (element) {
        return element.classList.toggle('showing');
      });
      [].concat(_toConsumableArray(toggleButtons)).forEach(function (element) {
        return element.classList.toggle('showing');
      });

      document.body.classList.add('animating');
      setTimeout(function () {
        return document.body.classList.remove('animating');
      }, 500);
    });
  });
});

window.onunload = function () {
  if (document.body.classList.contains('showing-second-panel')) window.scrollTo(0, 0);
};

},{}]},{},[1]);
