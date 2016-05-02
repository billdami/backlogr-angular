angular.module('backlogr').controller('GamesListController', 
  ['Games', '$stateParams', '$state', '$scope', '$rootScope', '$filter', 'hotkeys', 'Modal', 
  function(Games, $stateParams, $state, $scope, $rootScope, $filter, hotkeys, Modal) {
    var self = this;

    //make sure the route includes a valid category
    if(!Games.categories[$stateParams.cat]) {
      return $state.go('games.list', {cat: 'library'}, {location: 'replace'});
    }

    self.getFilteredGames = function() {
      var games = Games.games;
      games = $filter('filter')(games, self.gamesFilter);
      games = $filter('orderBy')(games, Games.orderBy);
      return games;
    };

    self.category = $stateParams.cat;
    self.gamesService = Games;
    self.gamesFilter = Games.categories[$stateParams.cat].filters;
    self.games = self.getFilteredGames();
    self.numSelected = Games.getSelection(self.gamesFilter).length;
    self.hasSelection =  self.numSelected > 0;
    self.lastFocusedGame = null;
    self.initScrollPos = Games.categories[$stateParams.cat].scrollPos;

    $scope.$watch(
      function() {
        return Games.games;
      },
      function() {
        self.games = self.getFilteredGames();
      }, true);

    $scope.$watch(
      function() {
        return Games.getOrderBy();
      },
      function() {
        self.games = self.getFilteredGames();
      });

    $scope.$watch(
      function() {
        return Games.getSelection(self.gamesFilter).length;
      },
      function(newVal) {
        self.numSelected = newVal;
      });

    $scope.$watch(
      function() {
        return Games.hasSelection(self.gamesFilter);
      },
      function(newVal) {
        self.hasSelection = newVal;
      });

    self.openAddGameForm = function(event) {
      event.stopPropagation();
      $rootScope.$broadcast('openAddGameForm');
    };

    self.openDetail = function(game) {
      $state.go('games.detail', {cat: $stateParams.cat, id: game.id});
    };

    self.markSelectionCompleted = function() {
      Games.updateSelection({completed: true, wishlisted: false}, self.gamesFilter, true);
    };

    self.moveSelectionToLibrary = function() {
      Games.updateSelection({wishlisted: false}, self.gamesFilter, true);
    };

    self.moveSelectionToBacklog = function() {
      Games.updateSelection({completed: false, wishlisted: false}, self.gamesFilter, true);
    };

    self.moveSelectionToWishlist = function() {
      Games.updateSelection({wishlisted: true}, self.gamesFilter, true);
    };

    self.starSelection = function() {
      Games.updateSelection({starred: true}, self.gamesFilter, true);
    };

    self.unstarSelection = function() {
      Games.updateSelection({starred: false}, self.gamesFilter, true);
    };

    self.removeSelection = function() {
      Modal.showConfirm({
        confirmTitle: "Delete games",
        bodyText: "Are you sure you want to delete the selected games?",
        confirmBtnText: "Delete",
        cancelBtnText: "Cancel",
        onConfirm: angular.bind(self, function() {
          Games.removeSelection(self.gamesFilter, true);
        })
      });
    };

    self.onStarToggle = function(result) {
      Games.update(result.game, {starred: result.active}, false);
    };

    self.updateSortProp = function(prop) {
      Games.updateSortProp(prop);
    };

    self.toggleSortDir = function() {
      Games.toggleSortDir();
    };

    self.toggleSelection = function() {
      if(self.numSelected === 0) {
        Games.selectGames(self.games);
      } else {
        Games.deselectGames(self.games);
      }
    };

    self.onGameClick = function(game, event) {
      var index = self.games.indexOf(game);
      var lastIndex = self.lastFocusedGame ? self.games.indexOf(self.lastFocusedGame) : -1;
      var range = [];
      var rangeStart = Math.min(index, lastIndex);
      var rangeEnd = Math.max(index, lastIndex);

      self.lastFocusedGame = game;

      if(event.ctrlKey || event.metaKey) {
        Games.toggleGameSelection(game);
      } else {
        Games.selectGame(game);
      }

      if(event.shiftKey && lastIndex !== -1 && index !== lastIndex) {
        while(rangeStart <= rangeEnd) {        
          range.push(self.games[rangeStart]);
          rangeStart++;
        }

        Games.selectGames(range);
      }
    };

    self.onGameSelClick = function(game, event) {
      var index = self.games.indexOf(game);
      var lastIndex = self.lastFocusedGame ? self.games.indexOf(self.lastFocusedGame) : -1;
      var range = [];
      var rangeStart = Math.min(index, lastIndex);
      var rangeEnd = Math.max(index, lastIndex);
      
      Games.toggleGameSelection(game);
      self.lastFocusedGame = game;
      
      if(event.shiftKey && lastIndex !== -1 && index !== lastIndex) {
        while(rangeStart <= rangeEnd) {
          range.push(self.games[rangeStart]);
          rangeStart++;
        }

        Games.selectGames(range);
      }
    };

    self.onArrowDown = function(event) {
      var lastIndex = self.lastFocusedGame ? self.games.indexOf(self.lastFocusedGame) : -1;
      var nextIndex = (lastIndex === self.games.length - 1) ? 0 : lastIndex + 1;
      var focusedGame = self.games[nextIndex];

      if(Modal.isOpen()) {
        return;
      }

      if(focusedGame) {
        event.preventDefault();

        if(event.shiftKey) {
          //if the new focused game is already selected, deselect the previous game
          if(focusedGame.selected) {
            Games.deselectGame(self.lastFocusedGame);
          }

          Games.selectGame(focusedGame, true);
        } else {
          Games.selectGame(focusedGame, false);
        }

        focusedGame.lastFocused = true; 
        self.lastFocusedGame = focusedGame;
      }
    };

    self.onArrowUp = function(event) {
      var lastIndex = self.lastFocusedGame ? self.games.indexOf(self.lastFocusedGame) : 0;
      var nextIndex = (lastIndex === 0) ? self.games.length - 1 : lastIndex - 1;
      var focusedGame = self.games[nextIndex];

      if(Modal.isOpen()) {
        return;
      }

      if(focusedGame) {
        event.preventDefault();

        if(event.shiftKey) {
          //if the new focused game is already selected, deselect the previous game
          if(focusedGame.selected) {
            Games.deselectGame(self.lastFocusedGame);
          }

          Games.selectGame(focusedGame, true);
        } else {
          Games.selectGame(focusedGame, false);
        }

        focusedGame.lastFocused = true;
        self.lastFocusedGame = focusedGame;
      }
    };

    self.onListScroll = function(result) {
      Games.categories[$stateParams.cat].scrollPos = result.scrollTop;
    };

    hotkeys.bindTo($scope)
      .add({
        combo: ['down', 'shift+down'],
        description: 'select next game',
        callback: angular.bind(self, self.onArrowDown)
      })
      .add({
        combo: ['up', 'shift+up'],
        description: 'select previous game',
        callback: angular.bind(self, self.onArrowUp)
      });
  }
]);