angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // code goes here
})

.controller('SettingsCtrl', function($scope, $window) {
  $scope.data = {};
  // prevent keeping device awake in this view
  $scope.$on('$ionicView.enter', function() {
  if ($window.localStorage.getItem('keepAwake') === 'true')
    $window.plugins.insomnia.allowSleepAgain();
  });
  //Settings for keeping the device awake
  $scope.data.katoggle = $window.localStorage.getItem('keepAwake') === "true";
  $scope.awakeSet = function() {
    $window.localStorage.setItem('keepAwake', $scope.data.katoggle);
  };
})

.controller('TouchpadCtrl', function($scope, $rootScope, $ionicGesture, $window, socket, focus) {
  $scope.$on('$ionicView.enter', function() {
    if ($window.localStorage.getItem('keepAwake') === 'true') {
      $window.plugins.insomnia.keepAwake();
    } else {
      $window.plugins.insomnia.allowSleepAgain();
    }
    });
  // ionic.Platform.fullScreen(true, false);
  $scope.focusManager = {
    focusInputOnBlur: true
  };
  var isvisible = false;
  $scope.showKeyboard = function() {
    if (!isvisible) {
      console.log("Showing keyboard.");
      // cordova.plugins.Keyboard.show();
      focus('focusMe');
      isvisible = true;
    } else {
      $scope.focusManager = {
        focusInputOnBlur: false
      };
      cordova.plugins.Keyboard.close();
      isvisible = false;
      console.log("Hiding keyboard.");
    }
  };
})

.directive('focusOn',
    function() {
      return function(scope, elem, attr) {
        scope.$on('focusOn', function(e, name) {
          if (name === attr.focusOn) {
            elem[0].focus();
          }
        });
      };
    })
  // a fix for focus that I found on stackoverflow, it doesn't work as well as I want, but does
  // it's job for prototyping the app atm...
  .directive("detectFocus", function() {
    return {
      restrict: "A",
      scope: {
        onFocus: '&onFocus',
        onBlur: '&onBlur',
        focusOnBlur: '=focusOnBlur'
      },
      link: function(scope, elem) {

        elem.on("focus", function() {
          scope.onFocus();
          scope.focusOnBlur = true; //note the reassignment here, reason why I set '=' instead of '@' above.
        });

        elem.on("blur", function() {
          scope.onBlur();
          if (scope.focusOnBlur)
            elem[0].focus();
        });
      }
    };
  })

.directive('keypressEvents', [
  '$document',
  'socket',
  function($document, socket) {
    return {
      restrict: 'A',
      link: function() {
        // this is needed for backspace and shift, ctrl, meta etc.
        // I think these will be triggered by onscreen elements though.
        $document.bind('keyup', function(e) {
          var key = e.keyCode || e.which;
          if (key === 8) //backspace
            socket.emit('keypress', {
            key: key
          });
        });

        $document.bind('keypress', function(e) {
          var key = e.keyCode || e.which;
          socket.emit('keypress', {
            key: key
          });
        });
      }
    };
  }
])

.directive('detectGestures', function($ionicGesture, socket, $cordovaVibration, $timeout) {
  return {
    restrict: 'A',
    link: function($scope) {
      var touchpad = angular.element(document.querySelector('#touchpad'));
      var previousX,
        previousY,
        previousScroll;
      var scrollAccum = [];
      var righttaptimeout;

      $scope.data = {
        tapX: "",
        tapY: ""
      };

      $ionicGesture.on('dragstart', function(e) {
        // ionic.Platform.fullScreen(true, false);
        $scope.$apply(function() {
          // these values are needed to get a 0 start point on every dragstart
          previousX = event.gesture.touches[0].screenX;
          previousY = event.gesture.touches[0].screenY;
          socket.emit('dragstart', {});
          console.log('Dragstart');
        });
      }, touchpad);

      // I think this could be done with a $ionicGesture event, just for consistence
      $scope.dragEvent = function(event) {
        $scope.data.tapX = event.gesture.touches[0].screenX - previousX;
        $scope.data.tapY = event.gesture.touches[0].screenY - previousY;
        console.log("Should be: " + $scope.data.tapY + " " + $scope.data.tapY);
        socket.emit('dragging', {
          x: $scope.data.tapX,
          y: $scope.data.tapY
        });
      };

      $ionicGesture.on('dragend', function(e) {
        console.log('Dragend');
        $scope.$apply(function() {
          socket.emit('dragend', {});
        });
      }, touchpad);


      $ionicGesture.on('hold', function(e) {
        console.log(event.gesture.touches.length);

        $scope.$apply(function() {
          $cordovaVibration.vibrate(25);
          socket.emit('hold', {});
          console.log('Hold.');
        });
      }, touchpad);

      $ionicGesture.on('touch transformstart', function(e) {
        if (e.gesture.touches.length === 2) {
          // get previous scroll, so scrolling always starts at 0
          previousScroll = Math.trunc(event.gesture.touches[0].screenY);
          console.log($scope.data.dragY1);
        }
      }, touchpad);

      // scrolling function
      $ionicGesture.on('transform drag', function(e) {
        $scope.$apply(function() {
          if (e.gesture.touches.length === 2) {
            // the timeout is here to cancel the other 2 finger gesture, right click.
            $timeout.cancel(righttaptimeout);
            // console.log(e.gesture.changedTouches);
            $scope.data.dragY1 = Math.trunc(event.gesture.touches[0].screenY) - previousScroll;
            // console.log($scope.data.dragY1);
            scrollAccum.push($scope.data.dragY1);
            // console.log(scrollAccum);
            if (scrollAccum[scrollAccum.length - 2] > scrollAccum[scrollAccum.length - 1])
              socket.emit("scrollup", {});
            if (scrollAccum[scrollAccum.length - 2] < scrollAccum[scrollAccum.length - 1])
              socket.emit("scrolldown", {});
            if (scrollAccum[scrollAccum.length - 1] !== scrollAccum[scrollAccum.length - 2]) {}
          }
        });
      }, touchpad);


      $ionicGesture.on('release', function(e) {
        $scope.$apply(function() {
          // cleaning accumulated scroll array
          scrollAccum = [];
          //cancel the potential right click event
          $timeout.cancel(righttaptimeout);
          socket.emit('release', {});
          console.log('Release.');
        });
      }, touchpad);


      //right click event, it'll wait 200ms before triggering so it doesn't overlap with
      //the scroll function
      $ionicGesture.on('touchstart', function(e) {
        $scope.$apply(function() {
          if (e.touches.length === 2) {
            righttaptimeout = $timeout(function() {
              $cordovaVibration.vibrate([50, 50]);
              socket.emit('rightclick');
              console.log("Right Click");
            }, 200);
          }
          console.log(e.touches.length);
        });
      }, touchpad);

      $ionicGesture.on('tap', function(e) {
        $scope.$apply(function() {
          socket.emit('tap', {});
          console.log('Tapped.');
        });
      }, touchpad);
    }
  };
});
