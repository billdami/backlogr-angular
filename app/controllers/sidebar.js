angular.module('backlogr').controller('SidebarController', ['$state', '$scope', 'Games', function($state, $scope, Games) {
  var self = this;

  self.categoryCounts = Games.getCategoryCounts();

  $scope.$watch(
    function() {
      return Games.getCategoryCounts();
    },
    function(newVal, oldVal) {
      if(newVal !== oldVal) {
        self.categoryCounts = newVal;
      }
    }, true);

  self.closeNavAndGo = function(route, params) {
    $scope.appCtrl.closeLeftNav(true).then(function() {
      $state.go(route, params);
    });
  };

  self.categoryCls = function(cat) {
    return {
      active: $state.includes('games', {cat: cat})
    };
  };
}]);