angular.module('backlogr').factory('Platforms', ['$http', '$q', '$filter', function($http, $q, $filter) {
  var PLATFORMS_API_URL = 'https://libjitsu.herokuapp.com/api/platforms';

  return {
    platforms: false,

    groups: [
      //TODO favorite platforms
      //{id: 'user-pref', label: 'Favorite Platforms'},
      {id: 'gen-8', label: 'Current Generation'},
      {id: 'gen-7', label: 'Last Generation (2005 - 2012)'},
      {id: 'gen-6', label: '6th Generation (1998 - 2005)'},
      {id: 'gen-5', label: '5th Generation (1993 - 1999)'},
      {id: 'gen-4', label: '4th Generation (1987 - 1995)'},
      {id: 'gen-3', label: '3rd Generation (1983 - 1987)'},
      {id: 'gen-2', label: '2nd Generation (1976 - 1983)'},
      {id: 'gen-1', label: '1st Generation (1972 - 1976)'},
      {id: 'retro-pc', label: 'Retro Personal Computers'},
      {id: 'other', label: 'Other'}
    ],

    all: function() {
      var self = this;

      //we only retrieve the platforms once, and then cache them
      if(!self.platforms) {
        return $http.get(PLATFORMS_API_URL).then(function(response) {
          angular.forEach(response.data.platform, function(platform, index) {
            if(!platform.group) {
              response.data.platform[index].group = 'other';
            }
          });

          self.platforms = response.data.platform;
          return self.platforms;
        });
      }

      return $q.defer().resolve(self.platforms);
    },

    get: function(id) {
      return $filter('findByProperty')(this.platforms, '_id', parseInt(id, 10));
    }
  }
}]);