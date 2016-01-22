angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


})

.controller('TouchpadCtrl', function($scope, $rootScope, $ionicGesture, socket, $cordovaVibration, focus) {
  ionic.Platform.fullScreen(true, false);
  $scope.showKeyboard = function() {
    var isvisible = true;
    if (isvisible) {
      console.log("Showing keyboard.");
      cordova.plugins.Keyboard.show();
      focus('focusMe');
      isvisible = false;
    } else {
      cordova.plugins.Keyboard.close();
      isvisible = true;
      console.log("Hiding");
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
.directive('keypressEvents', [
  '$document',
  'socket',
  function($document, socket) {
    return {
      restrict: 'A',
      link: function() {
        $document.bind('keyup', function(e) {
          var target = $document[0].getElementById('keyboard').value;
          var keyCd = e.keyCode || e.which;
          if (keyCd === 229) {
            keyCd = target.charCodeAt(target.length - 1);
          }
          socket.emit('keypress', {key: keyCd});
        });
      }
    };
  }
])
.directive('detectGestures', function($ionicGesture, socket) {
  return {
    restrict: 'A',
    link: function($scope) {
      var touchpad = angular.element(document.querySelector('#touchpad'));
      var previousX,
              previousY,
              currentx,
              currenty;
      $ionicGesture.on('dragstart', function(e){
        ionic.Platform.fullScreen(true, false);
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
          $cordovaVibration.vibrate(100);
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

      $ionicGesture.on('swipeup', function(e){
        $scope.$apply(function() {
          socket.emit('swipeup', {});
          console.log('Swiping up...');
        });
      }, touchpad);

      $ionicGesture.on('swipedown', function(e){
        $scope.$apply(function() {
          socket.emit('swipedown', {});
          console.log('Swiping down...');
        });
      }, touchpad);

    }
  };
});
