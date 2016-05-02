angular.module('backlogr').directive('textContentEditor', ['$document', function($document) {
  return {
    restrict: 'E',
    scope: {
      content: '<',
      onChange: '&',
      placeholder: '@'
    },
    templateUrl: 'directives/text-content-editor.html',
    link: function(scope, element) {
      var onDocClick = function(event) {
        if(event && element && element[0].contains(event.target)) {
          return;
        }

        $document.off('click', onDocClick);
        scope.$apply(function() {
          scope.isEditing = false;
        });
      };

      scope.content = !scope.content ? '' : scope.content.trim();
      scope.isEditing = false;
      scope.focusTextarea = false;

      scope.onContentClick = function() {
        scope.isEditing = true;
        scope.focusTextarea = true;
        $document.on('click', onDocClick);
      };

      scope.onContentChange = function() {
        if(scope.onChange) {
          scope.onChange({content: scope.content.trim()});
        }
      };

      scope.$on('$destroy', function() {
        $document.off('click', onDocClick);
      });
    }
  };
}]);