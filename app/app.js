angular.module('backlogr', [
  'ngSanitize',
  'ngAnimate', 
  'ui.router', 
  'ui.bootstrap.dropdown', 
  'cfp.hotkeys',
  'comboBox', 
  'toastNotifications'
])

//configure angular-hotkeys service
.config(['hotkeysProvider', function(hotkeysProvider) {
  hotkeysProvider.includeCheatSheet = false;
}])

//intialize the fastclick library for mobile
.run(['$window', '$document', function($window, $document) {
  $window.FastClick.attach($document[0].body);
}]);