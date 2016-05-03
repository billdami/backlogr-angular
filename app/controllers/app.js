angular.module('backlogr').controller('AppController', [
  '$timeout', 'Window', 'Modal', 'LocalStorage', 
  function($timeout, WindowService, Modal, LocalStorage) {
    var self = this;
    var navTransitionDuration = 300;

    self.leftNavIsOpen = true;

    //hide the app loading mask upon boot
    $timeout(function() {
      self.isLoaded = true;
    }, 1);

    //show a welcome message modal if this is the user's first visit
    if(!LocalStorage.get('welcomeShown')) {
      //need to delay opening the modal a bit, so that it can animate properly
      $timeout(function() {
        Modal.show({
          templateUrl: 'modals/welcome.html',
          controllerAs: 'welcomeCtrl',
          controller: ['$scope', 'close', function($scope, close) {
            $scope.closeModal = function() {
              //update local storage flag
              LocalStorage.set('welcomeShown', true);
              close();
            };
          }]
        });
      }, 100);
    }

    self.toggleLeftNav = function() {
       return self[self.leftNavIsOpen ? 'closeLeftNav' : 'openLeftNav']();
    };

    self.closeLeftNav = function() {
      self.leftNavIsOpen = false;
      return $timeout(function() { 
        return self.leftNavIsOpen; 
      }, WindowService.isSmallDevice() ? navTransitionDuration : 0);
    };

    self.openLeftNav = function() {
      self.leftNavIsOpen = true;
      return $timeout(function() { 
        return self.leftNavIsOpen; 
      },  WindowService.isSmallDevice() ? navTransitionDuration : 0);
    };
  }]
);