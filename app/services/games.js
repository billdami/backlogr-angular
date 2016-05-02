angular.module('backlogr').factory('Games', [
  '$http', '$filter', '$q', 'LocalStorage', 'ToastsService', 
  function($http, $filter, $q, LocalStorage, ToastsService) {
    var GBGAMES_API_URL = 'http://libjitsu.herokuapp.com/api/giantbomb-games';
    var THUMB_BASE_URL = 'https://d13cj59cnxon24.cloudfront.net/games/thumb/';

    var gamesService =  {
      games: [],
      gbGamesCache: {},
      orderBy: null,
      orderByProp:  null,
      orderDesc: false,

      categories: {
        library: {
          scrollPos: 0,
          filters: {wishlisted: false}
        },
        backlog: {
          scrollPos: 0,
          filters: {completed: false, wishlisted: false}
        },
        completed: {
          scrollPos: 0,
          filters: {completed: true, wishlisted: false}
        },
        wishlist: {
          scrollPos: 0,
          filters: {wishlisted: true}
        },
        starred: {
          scrollPos: 0,
          filters: {starred: true}
        }
      },

      init: function() {
        this.games = this._fetchGamesFromStorage();
        this.orderByProp = LocalStorage.get('gamesOrderByProp') || ' gameName';
        this.orderDesc = LocalStorage.get('gamesOrderDesc') || false;
        this.updateSorting();
        return this; 
      },

      getCategoryCounts: function() {
        var counts = {};

        angular.forEach(this.categories, function(cat, catName) {
          counts[catName] = $filter('filter')(this.games, cat.filters).length
        }, this);

        return counts;
      },

      searchGiantBombGames: function(term, platformId, limit, offset) {
        var self = this;

        return $http.get(GBGAMES_API_URL, {params: {q: term, platform: platformId, limit: limit, offset: offset}}).then(function(response) {
          angular.forEach(response.data.giantbombGame, function(game, index) {
            response.data.giantbombGame[index].thumbImgUrl = self.getThumbUrl(game);
          });

          return response.data.giantbombGame;
        });
      },

      getGiantBombGame: function(id) {
        var self = this;
        var deferred = $q.defer();

        if(self.gbGamesCache[id]) {
          deferred.resolve(self.gbGamesCache[id]);
          return deferred.promise;
        }

        return $http.get(GBGAMES_API_URL + '/' + id).then(function(response) {
          if(!response.data.giantbombGame) {
            deferred.reject('Game not found!');
            return deferred.promise;
          }

          self.gbGamesCache[id] = response.data.giantbombGame;

          if(response.data.genre) {
            self.gbGamesCache[id].genreModels = response.data.genre;
          }

          if(response.data.platform) {
            self.gbGamesCache[id].platformModels = response.data.platform;
          }

          return self.gbGamesCache[id];
        });
      },

      getById: function(id) {
        return $filter('findByProperty')(this.games, 'id', parseInt(id, 10));
      },

      getThumbUrl: function(game) {
        var url = null;

        if(game.storedThumbImg || game.hasImg) {
          url = THUMB_BASE_URL + (game.gbGameId || game._id) + '.jpg' ;
        }

        return url;
      },

      create: function(props, showNotification) {
        var deferred = $q.defer();
        var err = false;
        var existingGame;
        var newGame;

        //validate required properties
        if(!props.platformId || !props.gbGameId || !props.platformName || !props.gameName) {
          err = 'Missing required fields.';
        }

        //make sure the game+platform is unique
        if(!err) {
          existingGame = $filter('findByProperty')(this.games, {
            platformId: props.platformId, 
            gbGameId: props.gbGameId
          });

          if(existingGame) {
            err = 'This game is already in your collection.';
          }
        }

        if(err) {
          if(showNotification) {
            ToastsService.add({text: err, context: 'danger'});
          }

          deferred.reject(err);
          return deferred.promise;
        }

        newGame = angular.extend({
          id: this._getNextId(),
          createdDate: new Date()
        }, props);

        this.games.push(newGame);

        if(showNotification) {
          ToastsService.add({text: '"' + newGame.gameName + '" has been added to your collection.'});
        }

        this._persistChanges();
        deferred.resolve(newGame);

        return deferred.promise;
      },

      update: function(game, props, showNotification) {
        var deferred = $q.defer();

        if(!game) {
          deferred.reject('The game could not be found.');
          return deferred.promise;
        }

        if(!props) {
          deferred.reject('No properties were provided.');
          return deferred.promise;
        }

        angular.forEach(props, function(val, prop) {
          game[prop] = val;
        }, this);

        game.updatedDate = new Date();

        if(props.completed === true) {
          game.completedDate = new Date();
        } else if (props.completed === false) {
          game.completedDate = null;
        }

        if(showNotification) {
          ToastsService.add({
            icon: this._getNotificationIcon(props),
            text: this._getNotificationText(props, 1, game.gameName)
          });
        }

        this._persistChanges();
        deferred.resolve(game);

        return deferred.promise;
      },

      remove: function(game, showNotification) {
        var deferred = $q.defer();
        var index = this.games.indexOf(game);
        var gameName = game.gameName;

        if(index === -1) {
          deferred.reject('The game could not be found.');
          return deferred.promise;
        }

        this.games.splice(index, 1);
        
        if(showNotification) {
          ToastsService.add({
            icon: 'trash', 
            text: '"' + gameName + '" has been removed.'
          });
        }

        this._persistChanges();
        deferred.resolve(true);

        return deferred.promise;
      },

      hasSelection: function(extraFilters) {
        var filterCfg = angular.extend({selected: true}, extraFilters ? extraFilters : {});
        return ($filter('findByProperty')(this.games, filterCfg) !== null);
      },

      getSelection: function(extraFilters) {
        var filterCfg = angular.extend({selected: true}, extraFilters ? extraFilters : {});
        return $filter('filter')(this.games, filterCfg);
      },

      selectGames: function(games) {
        _.each(games, function(game) {
          this.selectGame(game, true);
        }, this);
      },

      selectGame: function(game, maintainSelection) {
        if(!maintainSelection) {
          this.deselectAllGames();
        }

        game.selected = true;
      },

      deselectGames: function(games) {
        _.each(games, function(game) {
          this.deselectGame(game);
        }, this);
      },

      deselectGame: function(game) {
        game.selected = false;
      },

      toggleGameSelection: function(game) {
        game.selected = !game.selected;
      },

      deselectAllGames: function() {
        angular.forEach(this.games, this.deselectGame, this);
      },

      updateSelection: function(props, extraFilters, showNotification) {
        var selection;
        var gameName;

        if(!this.hasSelection(extraFilters)) {
          return;
        }

        selection = this.getSelection(extraFilters);
        gameName = selection[0].gameName;

        angular.forEach(selection, function(game) {
          this.update(game, props);
        }, this);

        if(showNotification) {
          ToastsService.add({
            icon: this._getNotificationIcon(props),
            text: this._getNotificationText(props, selection.length, gameName)
          });
        }
      },

      removeSelection: function(extraFilters, showNotification) {
        var selection;
        var gameName;

        if(!this.hasSelection(extraFilters)) {
          return;
        }

        selection = this.getSelection(extraFilters);
        gameName = selection[0].gameName;

        angular.forEach(selection, function(game) {
          this.remove(game);
        }, this);

        if(showNotification) {
          ToastsService.add({
            icon: 'trash',
            text: selection.length > 1 ? 
              'The selected games have been removed.' : 
              '"' + gameName + '" has been removed.'
          });
        }
      },

      getOrderBy: function() {
        return this.orderBy;
      },

      updateSorting: function() {
        this.orderBy = (this.orderDesc ? '-' : '') + this.orderByProp;
        LocalStorage.set('gamesOrderByProp', this.orderByProp);
        LocalStorage.set('gamesOrderDesc', this.orderDesc);
      },

      updateSortProp: function(prop) {
        this.orderByProp = prop;
        this.updateSorting();
      },

      toggleSortDir: function() {
        this.orderDesc = !this.orderDesc;
        this.updateSorting();
      },

      _getNotificationText: function(changedVals, numGames, gameTitle) {
        var text = numGames > 1 ? 
          'The selected ' + numGames + ' games have been updated.' : 
          '"' + gameTitle + '" has been updated.';

        if(changedVals.completed === true && changedVals.wishlisted === false) {
          text = numGames > 1 ? 
            'The selected ' + numGames + ' games have been marked as completed.' :
            '"' + gameTitle + '" has been marked as completed.';
        } else if(changedVals.completed === false && changedVals.wishlisted === false) {
          text = numGames > 1 ? 
            'The selected ' + numGames + ' games have been moved to the backlog.' :
            '"' + gameTitle + '" has been moved to the backlog.';
        } else if(changedVals.wishlisted === false) {
          text = numGames > 1 ? 
            'The selected ' + numGames + ' games have been moved to your library.' :
            '"' + gameTitle + '" has been moved to your library.';
        } else if(changedVals.wishlisted === true) {
          text = numGames > 1 ? 
            'The selected ' + numGames + ' games have been moved to your wishlist.' :
            '"' + gameTitle + '" has been moved to your wishlist.';
        }

        return text;
      },

      _getNotificationIcon: function(changedVals) {
        var icon = 'check-circle';

        if(changedVals.completed === true && changedVals.wishlisted === false) {
          icon = 'check';
        } else if(changedVals.completed === false && changedVals.wishlisted === false) {
          icon = 'inbox';
        } else if(changedVals.wishlisted === false) {
          icon = 'university';
        } else if(changedVals.wishlisted === true) {
          icon = 'gift';
        }

        return icon;
      },

      _persistChanges: function() {
        LocalStorage.set('games', this.games);
      },

      _getNextId: function() {
        var largestId = _.reduce(this.games, function(prevVal, curVal) {
          return (prevVal.id > curVal.id) ? prevVal.id : curVal.id;
        }, 0);

        return largestId + 1;
      },

      _fetchGamesFromStorage: function() {
        var games = LocalStorage.get('games') || [];
        var dateFields = [
          'createdDate', 
          'updatedDate', 
          'releaseDate', 
          'completedDate'
        ];

        //deserialize data as needed
        games = _.map(games, function(game) { 
          _.each(dateFields, function(fld) {
            if(game[fld]) {
              game[fld] = new Date(game[fld]);
            }
          });

          //make sure selection state is not persisted
          game.selected = false; 
          return game;
        });

        return games;
      }
    };

    return gamesService.init();
  }
]);