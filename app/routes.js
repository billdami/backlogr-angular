angular.module('backlogr').config(
  ['$stateProvider', '$urlRouterProvider', 
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('games', {
        abstract: true,
        url: '/games/:cat',
        templateUrl: 'routes/games.html',
      })
      .state('games.list', {
        url: '',
        templateUrl: 'routes/games-list.html',
        controller: 'GamesListController as gamesListCtrl'
      })
      .state('games.detail', {
        url: '/game/:id',
        templateUrl: 'routes/game-detail.html',
        controller: 'GameDetailController as gameCtrl'
      })
      .state('about', {
        url: '/about',
        templateUrl: 'routes/about.html'
      })
      .state('404', {
        url: '/not-found',
        templateUrl: 'routes/not-found.html'
      });

    $urlRouterProvider.otherwise('/games/library');
  }]
);