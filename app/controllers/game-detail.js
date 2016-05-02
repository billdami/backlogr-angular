angular.module('backlogr').controller('GameDetailController', [
  'Games', '$state', '$stateParams', '$window', 
  function(Games, $state, $stateParams, $window) {
    var self = this;
    
    self.gamesService = Games;
    self.game = Games.getById($stateParams.id);
    self.gbGame = {};

    //make sure the route includes a valid game
    if(!self.game) {
      return $state.go('404', {}, {location: false});
    }

    self.amazonUrl = 'http://www.amazon.com/gp/search' + 
      '?ie=UTF8&camp=1789&creative=9325&index=videogames&keywords=' +
      $window.encodeURIComponent(self.game.gameName + ' ' + self.game.platformName) + 
      '&linkCode=ur2&tag=libjitsu-20';

    self.metacriticUrl = 'http://www.metacritic.com/search/game/' + 
      $window.encodeURIComponent(self.game.gameName) + '/results';

    self.gamefaqsUrl = 'http://www.gamefaqs.com/search?game=' +
      $window.encodeURIComponent(self.game.gameName);

    //fetch additional info about the game
    Games.getGiantBombGame(self.game.gbGameId).then(function(gbGame) {
      self.gbGame = gbGame;
    });

    self.markCompleted = function() {
      Games.update(self.game, {completed: true, wishlisted: false}, true);
    };

    self.moveToLibrary = function() {
      Games.update(self.game, {wishlisted: false}, true);
    };

    self.moveToBacklog = function() {
      Games.update(self.game, {completed: false, wishlisted: false}, true);
    };

    self.moveToWishlist = function() {
      Games.update(self.game, {wishlisted: true}, true);
    };

    self.star = function() {
      Games.update(self.game, {starred: true}, true);
    };

    self.unstar = function() {
      Games.update(self.game, {starred: false}, true);
    };

    self.onStarToggle = function(data) {
      Games.update(self.game, {starred: data.active}, false);
    };

    self.onNotesUpdate = function(data) {
      Games.update(self.game, {notes: data.content}, false);
    };

    self.remove = function() {
      Games.remove(self.game, true);
      self.backToList();
    };

    self.backToList = function() {
      $state.go('games.list', {cat: $stateParams.cat});
    };
  }
]);