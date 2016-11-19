/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }

  // Main initialization
  document.addEventListener('DOMContentLoaded', function() {
// Global variables
    var video = document.createElement('video');
    var canvas = document.querySelector('canvas');
    var context = canvas.getContext('2d');
    var background;
    
    const setBackground = function () {
      background = context.getImageData(0, 0, 600, 450).data.slice();
    };
  
    document.addEventListener('keydown', function (event) {
      if (event.keyCode === 32) {
        setBackground();
      }
    });
    document.getElementById('background-button').addEventListener('click', function (event) {
      setBackground();
    });
  
    const onSuccessCallback = function (stream) {
// Use the stream from the camera as the source of the video element
      video.src = window.URL.createObjectURL(stream) || stream;
      video.play(); // Autoplay
    };
// Display an error
    const onErrorCallback = function (e) {
      var expl = 'An error occurred: [Reason: ' + e.code + ']';
      console.error(expl);
      alert(expl);
    };
// Get the video stream from the camera with getUserMedia
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({ video: true }, onSuccessCallback, onErrorCallback);
    } else {
      alert("no video");
    }
// Draw the video stream at the canvas object
    function drawVideoAtCanvas(obj, context) {
      window.setInterval(function() {
        context.drawImage(obj, 0, 0);
        if (background) {
          var threshold = document.getElementById('threshold-slider').value;
          var frame = context.getImageData(0, 0, 600, 450);
          for (var index = 0; index < frame.data.length; index += 4) {
            var framePixelValue = frame.data[index] + frame.data[index + 1] + frame.data[index + 2];
            var substractablePixelValue = background[index] + background[index + 1] + background[index + 2];
            var filterValue = Math.abs(framePixelValue - substractablePixelValue) > threshold * 3 ? 255 : 0;
            frame.data[index] = filterValue;
            frame.data[index + 1] = filterValue;
            frame.data[index + 2] = filterValue;
            // frame.data[index] -= 100;
          }
          context.putImageData(frame, 0, 0);
        }
      }, 1000);
    }
    
// Add event listener for our video's Play function in order to produce video at the canvas
    video.addEventListener('play', function() {
      document.getElementById('waiting').style.display = 'none';
      drawVideoAtCanvas(this, context);
    }, false);
  }, false);
  
})();
