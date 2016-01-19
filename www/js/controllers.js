angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


})


.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('TouchpadCtrl', function($scope, $rootScope, $ionicGesture, socket) {
  $scope.onGesture = function(gesture) {
    $scope.gesture = gesture;
    console.log(gesture);
  };

  var element = angular.element(document.querySelector('#content'));
  $ionicGesture.on('dragstart', function(e){
    $scope.$apply(function() {
      socket.emit('dragstart', {});
      console.log('Dragstart');
    });

  }, element);
  $ionicGesture.on('dragend', function(e){
    $scope.$apply(function() {
      socket.emit('dragend', {});
      console.log('Dragend');
    });

  }, element);

  $scope.data = {
     tapX : "",
     tapY : ""
   };
  $scope.dragEvent = function(event) {
      $scope.data.tapX = event.gesture.touches[0].clientX;
      $scope.data.tapY = event.gesture.touches[0].clientY;
      socket.emit('dragging', {x: $scope.data.tapX, y: $scope.data.tapY});
    };

  })
.controller('PlaylistCtrl', function($scope, $stateParams, $rootScope) {
  $rootScope.toggledrag = true;

});
