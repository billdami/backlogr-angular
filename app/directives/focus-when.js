angular.module('backlogr').directive('focusWhen', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    scope: {
      trigger: '=focusWhen'
    },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if(value === true) {
          $timeout(function() {
            element[0].focus();
            scope.trigger = false;
          });
        }
      });
    }
  };
}]);