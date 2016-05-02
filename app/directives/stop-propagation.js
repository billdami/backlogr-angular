angular.module('backlogr').directive('stopPropagation', [function() {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.on('click', function(event) {
        event.stopPropagation();
      });

      element.on('$destroy', function() {
        element.off('click');
      });
    }
  };
}]);