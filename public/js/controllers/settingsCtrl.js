'use strict';

// Make user and settings available for everyone through root scope.
habitrpg.controller('SettingsCtrl',
  ['$scope', 'User', '$rootScope', '$http', 'API_URL', 'Guide', '$location', '$timeout',
  function($scope, User, $rootScope, $http, API_URL, Guide, $location, $timeout) {

    // FIXME we have this re-declared everywhere, figure which is the canonical version and delete the rest
//    $scope.auth = function (id, token) {
//        User.authenticate(id, token, function (err) {
//            if (!err) {
//                alert('Login successful!');
//                $location.path("/habit");
//            }
//        });
//    }

    $scope.toggleStickyHeader = function(){
      User.set({"preferences.stickyHeader":!User.user.preferences.stickyHeader});
      $timeout(function(){window.location.reload()});
    }

    $scope.showTour = function(){
      User.set({'flags.showTour':true});
      $location.path('/tasks');
      $timeout(Guide.initTour);
    }

    $scope.showClassesTour = function(){
      Guide.classesTour();
    }

    $scope.showBailey = function(){
      User.set({'flags.newStuff':true});
    }

    $scope.saveDayStart = function(){
      var dayStart = +User.user.preferences.dayStart;
      if (_.isNaN(dayStart) || dayStart < 0 || dayStart > 24) {
        dayStart = 0;
        return alert('Please enter a number between 0 and 24');
      }
      User.set({'preferences.dayStart': dayStart});
    }

    $scope.language = window.env.language;
    $scope.avalaibleLanguages = window.env.avalaibleLanguages;

    $scope.changeLanguage = function(){
      $rootScope.$on('userSynced', function(){
        location.reload();
      });
      User.set({'preferences.language': $scope.language.code});
    }

    $scope.reroll = function(){
      User.user.ops.reroll({});
      $rootScope.modals.reroll = false;
      $rootScope.$state.go('tasks');
    }

    $scope.changePassword = function(changePass){
      if (!changePass.oldPassword || !changePass.newPassword || !changePass.confirmNewPassword) {
        return alert("Please fill out all fields");
      }
      $http.post(API_URL + '/api/v2/user/change-password', changePass)
        .success(function(){
          alert("Password successfully changed");
          $scope.changePass = {};
        })
        .error(function(data){
          alert(data);
        });
    }

    $scope.restoreValues = {};
    $rootScope.$watch('modals.restore', function(value){
      if(value === true){
        $scope.restoreValues.stats = angular.copy(User.user.stats);
        $scope.restoreValues.achievements = {streak: User.user.achievements.streak || 0};
      }
    })

    $scope.restore = function(){
      var stats = $scope.restoreValues.stats,
        achievements = $scope.restoreValues.achievements;
      User.set({
        "stats.hp": stats.hp,
        "stats.exp": stats.exp,
        "stats.gp": stats.gp,
        "stats.lvl": stats.lvl,
        "stats.mp": stats.mp,
        "achievements.streak": achievements.streak
      });
      $rootScope.modals.restore = false;
    }

    $scope.reset = function(){
      User.user.ops.reset({});
      $rootScope.modals.reset = false;
      $rootScope.$state.go('tasks');
    }

    $scope['delete'] = function(){
      $http['delete'](API_URL + '/api/v2/user')
        .success(function(){
          localStorage.clear();
          window.location.href = '/logout';
        })
        .error(function(data){
          alert(data);
        });
    }
  }
]);
