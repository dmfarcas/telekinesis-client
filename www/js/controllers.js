angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // code goes here
})

.controller('SettingsCtrl', function($scope) {
  $scope.settings = "Hello Angular";
})


.controller('TouchpadCtrl', function($scope, $rootScope, $ionicGesture, socket, focus) {
  // ionic.Platform.fullScreen(true, false);
  $scope.focusManager = { focusInputOnBlur: true};

  var isvisible = false;
  $scope.showKeyboard = function() {
    if (!isvisible) {
      console.log("Showing keyboard.");
      // cordova.plugins.Keyboard.show();
      focus('focusMe');
      isvisible = true;
    } else {
      $scope.focusManager = { focusInputOnBlur: false};
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
        if(name === attr.focusOn) {
          elem[0].focus();
        }
      });
   };
})
// a fix for focus that I found on stackoverflow, it doesn't work as well as I want, but does
// it's job for prototyping the app atm...
.directive("detectFocus", function () {
        return {
            restrict: "A",
            scope: {
                onFocus: '&onFocus',
                onBlur: '&onBlur',
                focusOnBlur: '=focusOnBlur'
            },
            link: function (scope, elem) {

                elem.on("focus", function () {
                    scope.onFocus();
                    scope.focusOnBlur = true;  //note the reassignment here, reason why I set '=' instead of '@' above.
                });

                elem.on("blur", function () {
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
        // this is needed for backspace and maybe others
        $document.bind('keyup', function(e) {
          var  key = e.keyCode || e.which;
          if (key === 8)
            socket.emit('keypress', {key: key});
        });

        $document.bind('keypress', function(e) {
          // var target = $document[0].getElementById('keyboard').value;
          var  key = e.keyCode || e.which;
          //modifier keys
          var space = 32;
          var backspace = 8;
          var shift = e.shiftKey;
          var alt = 18;
          var ctrl = 17;
        //  if (keyCd === 229 || keyCd === 0) {
        //     keyCd = target.charCodeAt(target.length - 1);
        //    }
          // console.log("KeyCd is: " + keyCd + " e.keycodeis: " + e.keyCode + " ewhich" + e.which );
          console.log(key);
          socket.emit('keypress', {key: key});
        });
      }
    };
  }
])

.directive('detectGestures', function($ionicGesture, socket, $cordovaVibration) {
  return {
    restrict: 'A',
    link: function($scope) {
      var touchpad = angular.element(document.querySelector('#touchpad'));
      var previousX,
              previousY,
              currentx,
              currenty;


      $ionicGesture.on('dragstart', function(e){
        // ionic.Platform.fullScreen(true, false);
        $scope.$apply(function() {
          previousX = event.gesture.touches[0].screenX;
          previousY = event.gesture.touches[0].screenY;
          socket.emit('dragstart', {});
          console.log('Dragstart');
        });
      }, touchpad);

      $scope.data = {
         tapX : "",
         tapY : ""
       };

      $scope.dragEvent = function(event) {
          $scope.data.tapX = event.gesture.touches[0].screenX - previousX;
          $scope.data.tapY = event.gesture.touches[0].screenY - previousY;
          console.log("Should be: " + $scope.data.tapY + " " + $scope.data.tapY);
          socket.emit('dragging', {x: $scope.data.tapX, y: $scope.data.tapY});
        };

      $ionicGesture.on('dragend', function(e){
        console.log('Dragend');
        $scope.$apply(function() {
          socket.emit('dragend', {});
        });
      }, touchpad);

      $ionicGesture.on('hold', function(e){
        $scope.$apply(function() {
          $cordovaVibration.vibrate(25);
          socket.emit('hold', {});
          console.log('Hold.');
        });
      }, touchpad);

      $ionicGesture.on('touch', function(e){
        $scope.$apply(function() {
          socket.emit('touch', {});
          console.log('Touch.');
        });
      }, touchpad);

      $ionicGesture.on('release', function(e){
        $scope.$apply(function() {
          socket.emit('release', {});
          console.log('Release.');
        });
      }, touchpad);

      $ionicGesture.on('tap', function(e){
        $scope.$apply(function() {
          socket.emit('tap', {});
          console.log('Tapped.');
        });
      }, touchpad);
    }
  };
});
