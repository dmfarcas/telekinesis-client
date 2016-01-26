angular.module('telekinesis', ['ionic', 'starter.controllers', 'ngCordova'])
.factory('socket', function socket($rootScope) {
  var socket = io.connect("http://192.168.1.2:6910");
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
})
.factory('focus', function ($rootScope, $timeout) {
  return function(name) {
    $timeout(function (){
      $rootScope.$broadcast('focusOn', name);
    });
  };
})

.factory('notifications', function(socket) {
    return {
      ready: function() {
        document.addEventListener('deviceready', this.listen, false);
        console.log("Device ready.");
      },
      listen: function() {
        notificationListener.listen(function(n){
          socket.emit('notification', {notification: n});
          console.log("Sending to server: " + JSON.stringify(n) );
        }, function(e){
          console.log("Notification Error " + e);
        });
      }
    };
  })

  .factory('getcontacts', function($cordovaContacts, socket) {
    return {
      ready: function() {
        document.addEventListener('deviceready', this.get, false);
      },
      send: function() {
        console.log("Sending contacts to server...");
      },
      get: function() {
          $cordovaContacts.find({filter: ''}).then(function(result) {
          console.log("Sending contacts?");
          socket.emit('contacts', {contact: result});
      }, function(error) {
          console.log("ERROR: " + error);
      });
      }
    };
  })


  //startup stuff
  // leaving notifications open in rootscope for now until I figure out how to do it better
  .run(function($rootScope, notifications, getcontacts) {
    $rootScope.notifications = notifications;
    notifications.ready();
    $rootScope.getcontacts = getcontacts;
    getcontacts.ready();
  })




.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      if (ionic.Platform.isAndroid()) {
        StatusBar.backgroundColorByHexString('#209dc2');
    } else {
      StatusBar.styleLightContent();
    }
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.touchpad', {
      url: '/touchpad',
      views: {
        'menuContent': {
          templateUrl: 'templates/touchpad.html',
          controller: 'TouchpadCtrl'
        }
      }
    })

    .state('app.settings', {
        url: '/settings',
        views: {
          'menuContent': {
            templateUrl: 'templates/settings.html',
            controller: 'SettingsCtrl'
          }
        }
      });


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/touchpad');
});
