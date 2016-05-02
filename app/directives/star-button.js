angular.module('backlogr').directive('starButton', [function() {
  return {
    restrict: 'E',
    scope: {
      active: '<',
      onChange: '&',
      dontPropagateClick: '@'
    },
    templateUrl: 'directives/star-button.html',
    link: function(scope) {
      scope.active = !!scope.active;

      scope.onClick = function($event) {
        if(scope.dontPropagateClick) {
          $event.stopPropagation();
        }

        scope.active = !scope.active;

        if(scope.onChange) {
          scope.onChange({active: scope.active});
        }
      };
    }
  };
}]);