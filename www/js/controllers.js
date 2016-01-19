angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


})

.controller('TouchpadCtrl', function($scope, $rootScope, $ionicGesture, socket) {
  var touchpad = angular.element(document.querySelector('#touchpad'));

  $ionicGesture.on('dragstart', function(e){
    $scope.$apply(function() {
      socket.emit('dragstart', {});
      console.log('Dragstart');
    });

  }, touchpad);
  $ionicGesture.on('dragend', function(e){
    $scope.$apply(function() {
      socket.emit('dragend', {});
      console.log('Dragend');
    });
  }, touchpad);

  $ionicGesture.on('hold', function(e){
    $scope.$apply(function() {
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

  $scope.data = {
     tapX : "",
     tapY : ""
   };
  $scope.dragEvent = function(event) {
      $scope.data.tapX = Math.floor(event.gesture.touches[0].screenX);
      $scope.data.tapY = Math.floor(event.gesture.touches[0].screenY);
      socket.emit('dragging', {x: $scope.data.tapX, y: $scope.data.tapY});
    };

  });
