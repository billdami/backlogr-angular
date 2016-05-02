//source: http://phpjs.org/functions/nl2br/

angular.module('backlogr').filter('nl2br', function() {
  return function(text) {
    return !text ? '' : (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
  };
});