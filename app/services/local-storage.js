angular.module('backlogr').factory('LocalStorage', ['$window', function($window) {
  var memStorage = {};
  var testVal = 'ls-test';
  var hasLocalStorage;

  try {
    $window.localStorage.setItem(testVal, testVal);
    $window.localStorage.removeItem(testVal);
    hasLocalStorage = true;
  } catch(e) {
    hasLocalStorage = false;
  }

  return {
    set: function(key, data) {
      if(hasLocalStorage) {
        $window.localStorage.setItem(key, $window.JSON.stringify(data));
      } else {
        memStorage[key] = data;
      }
    },

    get: function(key) {
      var data;

      if(hasLocalStorage) {
        data = $window.localStorage.getItem(key);

        if(data !== null) {
          try {
            data = $window.JSON.parse(data);
          } catch(e) {
            data = null;
          }
        }
      } else {
        data = memStorage[key];
      }

      return data;
    },

    remove: function(key) {
      if(hasLocalStorage) {
        $window.localStorage.removeItem(key);
      } else if(memStorage[key]) {
        delete memStorage[key];
      }
    },

    removeAll: function() {
      if(hasLocalStorage) {
        $window.localStorage.clear();
      } else {
        memStorage = {};
      }
    }
  };
}]);