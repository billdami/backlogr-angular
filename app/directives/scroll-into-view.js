angular.module('backlogr').directive('scrollIntoView', [function() {
  return {
    restrict: 'A',
    scope: {
      scrollIntoView: '=',
      offsetDepth: '='
    },
    link: function(scope, element) {
      var el = element[0];
      var parent = el.offsetParent;
      var curDepth = 1;

      if(scope.offsetDepth && scope.offsetDepth > 1) {
        while(curDepth < scope.offsetDepth && parent) {
          el = parent;
          parent = parent.offsetParent;
          curDepth++;
        }
      }

      scope.$watch('scrollIntoView', function(value) {
        var elHeight = el.offsetHeight;
        var elBottomY = el.offsetTop + elHeight;
        var parHeight = parent && parent.offsetHeight ? parent.offsetHeight : 0;

        if(value === true && parHeight) {
          scope.scrollIntoView = false;

          if(el.offsetTop < parent.scrollTop) {
            //scroll up
            parent.scrollTop = el.offsetTop;
          } else if(elBottomY > (parHeight + parent.scrollTop)) {
            //scroll down
            parent.scrollTop = elBottomY - parHeight;
          }
        }
      });
    }
  };
}]);