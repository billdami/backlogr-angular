angular.module('backlogr').controller('AddGameFormController', [
  'Games', 'Platforms', 'Window', '$filter', '$rootScope', '$scope', 
  function(Games, Platforms, Window, $filter, $rootScope, $scope) {
    var self = this;

    self.dropdownIsOpen = false;
    self.focusPlatformSelect = false;
    self.completed = false;
    self.wishlisted = false;
    self.gbGames = [];
    self.searchDebounceDelay = 250;
    self.searchIsLoading = false;

    self.gameInputValue = '';
    self.game = null;
    self.platform = '';
    self.platforms = [];
    self.filteredPlatforms = [];
    self.filteredPlatformGroups = [];
    self.platformsLoading = true;

    //change the completed/wishlisted checkboxes depending on the currently open category
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams) {
      if(toParams.cat && Games.categories[toParams.cat] && Games.categories[toParams.cat].filters) {
        self.completed = (Games.categories[toParams.cat].filters.completed === true);
        self.wishlisted = (Games.categories[toParams.cat].filters.wishlisted === true);
      }
    });

    //allow other parts of the app to open the dropdown
    $scope.$on('openAddGameForm', function() {
      self.dropdownIsOpen = true;
    });

    //focus the platform select when the dropdown form is opened (on desktop-sized devices only)
    $scope.$watch(
      function() {
        return self.dropdownIsOpen; 
      }, 
      function(newValue) {
        if(newValue === true && Window.isLargeDevice()) {
          self.focusPlatformSelect = true;
        }
      });
    
    Platforms.all().then(function(platforms) {
      self.platformsLoading = false;
      self.platforms = platforms;
      self.updateFilteredPlatforms();
    });

    self.updateFilteredPlatforms = function() {
      if(!self.game || !self.game.platforms) {
        self.filteredPlatformGroups = Platforms.groups;
        self.filteredPlatforms = self.platforms;
        return;
      }

      self.filteredPlatforms = $filter('filter')(self.platforms, function(platform) {
        return self.game.platforms.indexOf(platform._id) !== -1;
      });

      self.filteredPlatformGroups = $filter('filter')(Platforms.groups, function(group) {
        return $filter('findByProperty')(self.filteredPlatforms, 'group', group.id) !== null;
      });

      //if there is only 1 platform, auto-select it
      if(self.filteredPlatforms.length === 1) {
        self.platform = String(self.filteredPlatforms[0]._id);
      }
    };
    
    self.searchGames = function(input) {
      var query = input.term.trim();
      self.gameInputValue = query;

      if(query.length < 1) {
        self.gbGames = [];
        return;
      }
      
      self.searchIsLoading = true;
      self.querySearchApi(query);
    };

    self.querySearchApi = _.debounce(function(query) {
      Games.searchGiantBombGames(query, self.platform, 20, 0).then(function(games) {
        self.searchIsLoading = false;
        self.gbGames = games;
      });
    }, self.searchDebounceDelay);

    self.onPlatformChange = function() {
      if(self.gameInputValue.length > 0) {
        self.searchGames({term: self.gameInputValue});
      }
    };

    self.onSelectGame = function(selection) {
      self.game = selection.item;
      self.updateFilteredPlatforms();
    };

    self.onClearGameSelection = function() {
      self.game = null;
      self.updateFilteredPlatforms();
    };

    self.addGame = function(props, closeDropDown) {
      Games.create(props, true).then(function() {
        self.clearForm();

        if(closeDropDown) {
          self.closeDropDown();
        }
      });
    };

    self.formIsValid = function() {
      return (!self.form.$invalid && self.game);
    };

    self.clearForm = function() {
      self.game = null;
      self.gbGames = [];
    };

    self.closeDropDown = function() {
      self.dropdownIsOpen = false;
    }

    self.onSubmit = function() {
      var platform = Platforms.get(self.platform);
      
      self.addGame({
        platformId: platform._id,
        platformName: platform.name,
        gbGameId: self.game._id,
        gameName: self.game.name,
        hasImg: self.game.storedThumbImg,
        releaseDate: new Date(self.game.normalizedReleaseDate),
        completed: self.completed,
        wishlisted: self.wishlisted,
        starred: false
      }, true);
    };
  }
]);