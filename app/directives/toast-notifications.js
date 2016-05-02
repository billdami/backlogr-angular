angular.module('toastNotifications', [])

  .factory('ToastsService', ['$timeout', function($timeout) {

    return {
      _items: [],

      _defaultConfig: {
        text: '',
        //default|success|danger|warning|info
        context: 'default',
        icon: null,
        autoClose: true,
        closeOnClick: true,
        closeDelay: 3500
      },

      _defaultIcons: {
        'default': 'check-circle',
        'success': 'check-circle',
        'danger': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
      },

      add: function(config) {
        var self = this;
        var toast = angular.extend({}, self._defaultConfig, config);
        
        if(toast.icon === null) {
          toast.icon = self._defaultIcons[toast.context];
        }

        self._items.push(toast);
        self.startCloseTimer(toast);
      },

      remove: function(item) {
        var self = this;
        var index = self._items.indexOf(item);

        if(index > -1) {
          self.clearCloseTimer(item);
          self._items.splice(index, 1);
        }
      },

      removeAll: function() {
        var self = this;

        angular.forEach(self._items, function(item) {
          self.clearCloseTimer(item);
        });

        self._items = [];
      },

      startCloseTimer: function(item) {
        var self = this;

        if(item.autoClose && item.closeDelay > 0) {
          self.clearCloseTimer(item);
          item.closeTimer = $timeout(angular.bind(self, self.remove, item), item.closeDelay);
        }

        return item;
      },

      clearCloseTimer: function(item) {
        if(item.closeTimer) {
          $timeout.cancel(item.closeTimer);
        }

        return item;
      }
    }
  }])

  .controller('ToastsController', ['ToastsService', function(ToastsService) {
    var self = this;
    self.items = ToastsService._items;

    self.removeItem = function(item) {
      ToastsService.remove(item);
    };

    self.cancelAutoClose = function(item) {
      ToastsService.clearCloseTimer(item);
    };

    self.restartAutoClose = function(item) {
      ToastsService.startCloseTimer(item);
    };
  }])

  .directive('toastNotifications', [function() {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'directives/toast-notifications/toast-notifications.html',
      bindToController: true,
      controllerAs: 'toastsCtrl',
      controller: 'ToastsController'
    };
  }])

  .directive('toastItem', [function() {
    return {
      restrict: 'A',
      require: '^toastNotifications',
      scope: {
        toastItem: '='
      },
      templateUrl: 'directives/toast-notifications/toast-item.html',
      link: function(scope, elem, attr, toastsCtrl) {
        scope.hasIcon = (typeof scope.toastItem.icon === 'string');

        scope.toastClasses = {
          'close-on-click': scope.toastItem.closeOnClick,
          'has-media': scope.hasIcon
        };

        scope.iconClasses = {};

        if(scope.hasIcon) {
          scope.iconClasses['fa-' + scope.toastItem.icon] = true;
        }

        scope.toastClasses[scope.toastItem.context] = true;

        scope.onClick = function() {
          if(scope.toastItem.closeOnClick) {
            toastsCtrl.removeItem(scope.toastItem);
          }
        };

        scope.onMouseEnter = function() {
          toastsCtrl.cancelAutoClose(scope.toastItem);
        };

        scope.onMouseLeave = function() {
          toastsCtrl.restartAutoClose(scope.toastItem);
        };
      }
    };
  }])