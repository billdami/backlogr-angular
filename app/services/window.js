angular.module('backlogr').factory('Window', ['$window', function($window) {
  var win = {
    lgDeviceMinWidth: 992,
    windowWidth: 0,
    debounceDelay: 300,

    init: function() {
      this.winElem = angular.element($window);
      this.winElem.bind('resize', _.debounce(angular.bind(this, this.onWindowResize), this.debounceDelay));
      this.onWindowResize(); 
    },

    onWindowResize: function() {
      this.windowWidth = $window.innerWidth;
    },

    getWindowWidth: function() {
      return this.windowWidth;
    },

    isLargeDevice: function() {
      return (this.windowWidth >= this.lgDeviceMinWidth);
    },

    isSmallDevice: function() {
      return (this.windowWidth < this.lgDeviceMinWidth);
    } 
  };

  win.init();
  return win;
}]);