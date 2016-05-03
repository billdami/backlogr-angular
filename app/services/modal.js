/**
 * Modal service
 *
 * Heavily inspired by angular-modal-service (https://github.com/dwmkerr/angular-modal-service)
 */ 
angular.module('backlogr').factory('Modal', [
  '$document', '$animate', '$compile', '$templateRequest', '$controller', '$q', '$rootScope', '$timeout',
  function($document, $animate, $compile, $templateRequest, $controller, $q, $rootScope, $timeout) {
    var body = angular.element($document[0].body);

    var getTemplate = function(template, templateUrl) {
      var deferred = $q.defer();
      
      if(template) {
        deferred.resolve(template);
      } else if(templateUrl) {
        $templateRequest(templateUrl, true)
          .then(function(resTemplate) {
            deferred.resolve(resTemplate);
          }, function(error) {
            deferred.reject(error);
          });
      } else {
        deferred.reject("No template or templateUrl has been specified.");
      }

      return deferred.promise;
    };

    var appendChild = function(parent, child) {
      var children = parent.children();
      if(children.length > 0) {
        return $animate.enter(child, parent, children[children.length - 1])
          .then(function() {
            //focus on the modal element once it has been animated into the DOM
            $timeout(function() {
              child[0].focus();
            });
          });
      }
      return $animate.enter(child, parent)
        .then(function() {
          //focus on the modal element once it has been animated into the DOM
          $timeout(function() {
            child[0].focus();
          });
        });
    };

    return {
      _isOpen: false,
      _openModal: null,

      show: function(opts) {
        var self = this;
        var deferred = $q.defer();

        //only allow one modal to be open at a time
        if(self.isOpen()) {
          deferred.reject("Only one modal can be open at a time.");
          return deferred.promise;
        }

        if(!opts.controller) {
          deferred.reject("No controller has been specified.");
          return deferred.promise;
        }

        //gt the template html
        getTemplate(opts.template, opts.templateUrl)
          .then(function(template) {
            var modal;
            var modalElement;
            var linkFn;
            var controllerObjBefore;
            var modalController;

            //create a new scope for the modal
            var modalScope = (opts.scope || $rootScope).$new();

            //promises that are resolved when the modal is about to be closed, and is closed
            var closeDeferred = $q.defer();
            var closedDeferred = $q.defer();

            //create the inputs object to the controller
            //this will include the scope, as well as all inputs provided
            var inputs = {
              $scope: modalScope,
              close: function(result, delay) {
                var closeDelay = delay || 0;

                $timeout(function() {
                  //resolve the 'close' promise.
                  closeDeferred.resolve(result);

                  //let angular remove the element and wait for animations to finish.
                  $animate.leave(modalElement)
                    .then(function() {
                      //resolve the 'closed' promise.
                      closedDeferred.resolve(result);
                      //we can now clean up the scope
                      modalScope.$destroy();
                      modalScope = null;
                      modalElement = null;
                      closeDeferred = null;
                      self._isOpen = false;
                    });
                }, closeDelay);
              }
            };

            //  If we have provided any inputs, pass them to the controller
            if(opts.inputs) {
              angular.extend(inputs, opts.inputs);
            }

            //compile then link the template element, building the actual element
            //set the $element on the inputs so that it can be injected if required
            linkFn = $compile(template);
            modalElement = linkFn(modalScope);
            inputs.$element = modalElement;

            //create the controller, explicitly specifying the scope to use
            controllerObjBefore = modalScope[opts.controllerAs];
            modalController = $controller(opts.controller, inputs, false, opts.controllerAs);

            if(opts.controllerAs && controllerObjBefore) {
              angular.extend(modalController, controllerObjBefore);
            }

            //append the modal to the dom
            if(opts.appendElement) {
              //append to custom append element
              appendChild(opts.appendElement, modalElement);
            } else {
              //append to body when no custom append element is specified
              appendChild(body, modalElement);
            }

            modal = {
              controller: modalController,
              scope: modalScope,
              element: modalElement,
              close: closeDeferred.promise,
              closed: closedDeferred.promise
            };

            self._isOpen = true;
            deferred.resolve(modal);

          })
          .then(null, function(error) {
            deferred.reject(error);
          });

        return deferred.promise;
      },

      showConfirm: function(opts) {
        return this.show({
          templateUrl: 'modals/confirm.html',
          controller: ['$scope', 'confirmTitle', 'bodyText', 'confirmBtnText', 'cancelBtnText', 'close',
            function($scope, confirmTitle, bodyText, confirmBtnText, cancelBtnText, close) {
            $scope.confirmTitle = confirmTitle;
            $scope.bodyText = bodyText;
            $scope.confirmBtnText = confirmBtnText;
            $scope.cancelBtnText = cancelBtnText;

            $scope.onConfirmClick = function() {
              if(opts.onConfirm) {
                opts.onConfirm();
              }

              close();
            };

            $scope.onCancelClick = function() {
              if(opts.onCancel) {
                opts.onCancel();
              }

              close();
            };
          }],
          inputs: {
            confirmTitle: opts.confirmTitle || "Confirm Action",
            bodyText: opts.bodyText || "Are you sure?",
            confirmBtnText: opts.confirmBtnText || "Yes",
            cancelBtnText: opts.cancelBtnText || "No"
          }
        });
      },

      isOpen: function() {
        return this._isOpen;
      }
    };
  }]
);
  