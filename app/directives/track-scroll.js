angular.module('backlogr').directive('trackScroll', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    scope: {
      initScrollTop: '<',
      debounceDelay: '@',
      onScroll: '&'
    },
    link: function(scope, element) {
      var delay = parseInt(scope.debounceDelay, 10);
      var handleScroll;

      if(!delay || isNaN(delay)) {
        delay = 250;
      }

      if(scope.initScrollTop && !isNaN(scope.initScrollTop)) {
        //allow the element to be fully rendered before setting the intial scroll position
        $timeout(function() {
          element[0].scrollTop = scope.initScrollTop;
        }, 1);
      }

      handleScroll = _.debounce(function() {
        if(scope.onScroll) {
          scope.onScroll({scrollTop: element[0].scrollTop});
        }
      }, delay);

      element.on('scroll', handleScroll);

      element.on('$destroy', function() {
        element.off('scroll');
      });
    }
  };
}]);