angular.module('comboBox', [])

  .controller('comboBoxController', ['$scope', function($scope) {
    var self = this;
    var inputKeyMap = {
      13: 'selectFocusedItem',
      27: 'clear',
      38: 'selectPreviousItem',
      40: 'selectNextItem'
    };

    self.inputValue = '';
    self.isOpen = false;
    self.selectedItem = null;
    self.focusedItem = null;
    self.emptyText = self.emptyText || 'No results found';
    self.loadingText = 'Loading, please wait...';

    self.init = function() {
      //update the combobox when the model is changed externally
      $scope.$watch(self.getModel, function(newVal) {
        if(!self.internalModelChange) {
          if(newVal) {
            self.selectItem(newVal);
          } else {
            self.clearSelection(true);
          }
        }

        self.internalModelChange = false;
      });

      //watch when the items array changes, for auto-selection when needed
      $scope.$watch(self.getItems, function(newVal) {
        if(newVal && newVal.length > 0) {
          self.autoSelectExactMatch();
        }
      });
    };

    self.getModel = function() {
      return self.model;
    };

    self.getItems = function() {
      return self.items;
    };

    self.autoSelectExactMatch = function() {
      var i;

      if(self.inputValue && self.inputValue.length > 0 && self.items && self.items.length > 0) {
        for(i=0; i < self.items.length; i++) {
          if(self.inputValue.toUpperCase() === self.items[i][self.modelLabel].toUpperCase()) {
            self.selectItem(self.items[i], false);
            break;
          }
        }
      }
    };

    self.selectItem = function(item, closeMenu) {
      self.internalModelChange = true;
      self.selectedItem = item;
      self.model = item;
      self.focusedItem = null;
      self.inputValue = item[self.modelLabel];

      if(self.onInput) {
        self.onInput({term: self.inputValue});
      }

      if(self.onSelect) {
        self.onSelect({item: item});
      }

      if(closeMenu) {
        self.closeMenu();
      }
    };

    self.clearSelection = function(clearInput) {
      self.internalModelChange = true;
      self.selectedItem = null;
      self.model = null;

      if(clearInput) {
        self.inputValue = '';
      }

      if(self.onClearSelection) {
        self.onClearSelection();
      }
    };

    self.clear = function(event) {
      if(!self.inputValue || self.inputValue.length < 1) {
        return;
      }

      self.clearSelection(true);
      self.closeMenu();

      if(event) {
        event.stopPropagation();
      }
    };

    self.selectFocusedItem = function(event) {
      if(self.focusedItem) {
        self.selectItem(self.focusedItem, true);

        if(event) {
          event.preventDefault();
        }
      }
    };

    self.selectPreviousItem = function(event) {
      var itemIndex = -1;

      if(!self.isOpen) {
        return;
      }

      if(self.items && self.items.length > 0) {
        if(self.focusedItem) {
          itemIndex = self.items.indexOf(self.focusedItem) - 1;
        }

        if(itemIndex < 0) {
          itemIndex = self.items.length - 1;
        }

        self.focusedItem = self.items[itemIndex];
        self.items[itemIndex].lastFocused = true;
      }

      if(event) {
        event.preventDefault();
      }
    };

    self.selectNextItem = function(event) {
      var itemIndex = -1;

      if(!self.isOpen) {
        return;
      }

      if(self.items && self.items.length > 0) {
        if(self.focusedItem) {
          itemIndex = self.items.indexOf(self.focusedItem);
        }

        itemIndex++;

        if(itemIndex >= self.items.length) {
          itemIndex = 0;
        }

        self.focusedItem = self.items[itemIndex];
        self.items[itemIndex].lastFocused = true;
      }

      if(event) {
        event.preventDefault();
      }
    };

    self.openMenu = function() {
      self.isOpen = true;
    };

    self.closeMenu = function() {
      self.isOpen = false;
    };

    self.registerInput = function(input) {
      self.cbInput = input;
    };

    self.registerMenu = function(menu) {
      self.cbMenu = menu;
    };

    self.onInputChange = function() {
      self.clearSelection();

      if(self.inputValue.trim().length < 1) {
        self.closeMenu();
      } else {
        self.openMenu();
      }

      if(self.onInput) {
        self.onInput({term: self.inputValue});
      }
    };

    self.onInputKeyDown = function(event) {
      if(inputKeyMap[event.keyCode]) {
        self[inputKeyMap[event.keyCode]](event);
      }
    };

    self.onItemClick = function(item) {
      self.selectItem(item, true);
    };
  }])

  .directive('comboBox', [function() {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        items: '=',
        modelLabel: '@',
        modelImgUrl: '@',
        showImages: '@',
        itemTemplateUrl: '@',
        required: '@',
        placeholder: '@',
        emptyText: '@',
        isLoading: '=',
        onInput: '&',
        onSelect: '&',
        onClearSelection: '&'
      },
      templateUrl: 'directives/combo-box/combo-box.html',
      bindToController: true,
      controllerAs: 'cb',
      controller: 'comboBoxController',
      link: function(scope, elem, attr, cbCtrl) {
        cbCtrl.init();
      }
    };
  }])

  .directive('comboBoxMenu', [function() {
    return {
      restrict: 'E',
      transclude: true,
      require: '^comboBox',
      scope: {},
      templateUrl: 'directives/combo-box/combo-box-menu.html',
      link: function(scope, elem, attr, cbCtrl) {
        scope.cbCtrl = cbCtrl;
        cbCtrl.registerMenu(scope);
      }
    };
  }])

  .directive('comboBoxItem', [function() {
    return {
      restrict: 'A',
      require: '^comboBox',
      scope: {
        model: '='
      },
      templateUrl: 'directives/combo-box/combo-box-item.html',
      link: function(scope, elem, attr, cbCtrl) {
        scope.cb = cbCtrl;
        scope.label = scope.model[cbCtrl.modelLabel];
        scope.showImg = cbCtrl.showImages;

        if(cbCtrl.modelImgUrl) {
          elem.addClass('combo-box-item-has-img');
          scope.imgUrl = scope.model[cbCtrl.modelImgUrl];
        }
      }
    };
  }])

  .directive('comboBoxInput', [function() {
    return {
      restrict: 'A',
      require: '^comboBox',
      scope: {},
      link: function(scope, elem, attr, cbCtrl) {
        cbCtrl.registerInput(scope);
      }
    };
  }])