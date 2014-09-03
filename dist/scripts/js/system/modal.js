(function() {
  var myApp;

  myApp = angular.module('af.modal', ['af.event']);

  myApp.constant('DEFAULT_MODAL_PATH', 'src/views/templates/generic.modal.view.php');

  myApp.service("$modal", function($event, DEFAULT_MODAL_PATH) {
    var service;
    service = {
      url: null,
      scope: null,
      open: function(url, scope) {
        service.url = url;
        service.scope = scope;
        if (!service.url) {
          service.url = DEFAULT_MODAL_PATH;
        }
        return $event.shout("Modal.open", {
          url: service.url,
          scope: service.scope
        });
      },
      close: function(data) {
        service.url = null;
        service.scope = null;
        return $event.shout("Modal.close", data);
      },
      updateScope: function(scope) {
        return service.scope = scope;
      },
      getScope: function() {
        return service.scope;
      }
    };
    return service;
  });

  myApp.directive("modalHolder", function($modal, $timeout) {
    return {
      restrict: "A",
      scope: {},
      template: "<div id=\"modalHolder\" class=\"ng-cloak\" ng-show=\"modalURL\">" + "<div class=\"modal fade\" ng-click=\"close()\" style=\"display:block\">" + "<div class=\"modal-dialog\" ng-click=\"stopClickThrough($event)\" ng-include=\"modalURL\"></div>" + "</div>" + "<div class=\"modal-backdrop fade\" ng-click=\"close()\"></div>" + "</div>",
      link: function(scope, element, attrs) {
        scope.modalURL = $modal.url;
        scope.close = function() {
          $('body').removeClass('modal-open');
          $("#modalHolder").children().removeClass("in");
          return scope.modalURL = null;
        };
        scope.$on("Modal.open", function() {
          scope.modalURL = $modal.url;
          $('body').addClass('modal-open');
          return $timeout(function() {
            return $("#modalHolder").children().addClass("in");
          }, 50);
        });
        scope.$on("Modal.close", scope.close);
        return scope.stopClickThrough = function(event) {
          return event.stopImmediatePropagation();
        };
      }
    };
  });

}).call(this);
