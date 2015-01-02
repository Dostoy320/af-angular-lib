(function() {
  var myApp;

  myApp = angular.module('af.help', ['af.event', 'af.modal']);

  myApp.constant('$HELP_CONFIG', {
    genericHelpPath:'src/views/templates/generic.help.view.html'
  })

  myApp.service("$help", function($event) {
    var service;
    service = {
      isOpen:false,
      controller:{ title:null, body:null },
      open: function(title, body) {
        service.controller.title = title;
        service.controller.body = body;
        $event.shout("Help.open", service.controller);
        service.isOpen = true;
      },
      close: function(data) {
        if(!service.isOpen) return;
        service.isOpen = false;
        $event.shout("Help.close");
      }
    };
    return service;
  });

  myApp.directive("helpHolder", function($modal, $timeout, $HELP_CONFIG) {
    return {
      restrict: "A",
      scope: {},
      template: '<div id="helpHolder" class="ng-cloak" ng-if="url">' +
                  '<div class="modal fade" ng-click="close()" style="display:block; z-index:1042;">' +
                    '<div class="modal-dialog" ng-click="stopClickThrough($event)" ng-include="url"></div>' +
                  '</div>' +
                  '<div class="modal-backdrop fade" style="bottom:0; z-index: 1041;" ng-click="close()"></div>' +
                '</div>',
      link: function(scope, element, attrs) {
        scope.close = function() {
          $('body').removeClass('modal-open');
          $("#helpHolder").children().removeClass("in");
          return scope.url = null;
        };
        scope.$on("Help.open", function(event, controller) {
          scope.url = $HELP_CONFIG.genericHelpPath;
          scope.title = controller.title;
          scope.body = controller.body;
          $('body').addClass('modal-open');
          $timeout(function() {
            $("#helpHolder").children().addClass("in");
          }, 50);
        });
        scope.$on("Help.close", scope.close);
        scope.stopClickThrough = function(event) {
          event.stopImmediatePropagation();
        };
      }
    };
  });

  myApp.GenericHelpCtrl = myApp.controller('GenericHelpCtrl', function($scope, $help) {
    var defaultController = {
      title:null,
      body:null,
      closeBtnLabel:'Close',
      clickClose: function() { return $help.close(); }
    };
    _.extend($scope, defaultController, $help.controller);
  });


}).call(this);
