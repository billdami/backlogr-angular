angular.module('backlogr').directive('modalDialog', [function() {
  return {
    restrict: 'E',
    scope: {
      modalTitle: '@',
      modalSize: '@',
      backdrop: '<',
      backdropClickClose: '<',
      escClose: '<',
      closeable: '<',
      close: '&'
    },
    templateUrl: 'directives/modal-dialog.html',
    replace: true,
    transclude: true,
    bindToController: true,
    controllerAs: 'modalCtrl',
    controller: function() {
      var self = this;
      self.showBackdrop = (self.backdrop !== false);
      self.allowClose = (self.closeable !== false);
      self.closeOnClick = (self.backdropClickClose !== false);
      self.closeOnEsc = (self.escClose !== false);
    
      self.closeModal = function() {
        if(self.allowClose && self.close) {
          self.close();
        }
      };

      self.onBackdropClick = function(event) {
        if(self.closeOnClick && angular.element(event.target).hasClass('modal')) {
          self.closeModal();
        }
      };

      self.onBackdropKeydown = function(event) {
        if(event.keyCode === 27 && self.closeOnEsc) {
          self.closeModal();
        }
      };
    },
    link: function(scope, elem, attr, modalCtrl) {
      scope.modalCtrl = modalCtrl;
    }
  };
}]);