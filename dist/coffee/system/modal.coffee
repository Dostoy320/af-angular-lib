#
#
nawlsDir = angular.module('nawlbergs.system')
nawlsDir.service "$modal", ($event, DEFAULT_MODAL_PATH) ->
  service =
    url: null
    ctrl: null

    open: (url, ctrl) ->
      service.url ?= DEFAULT_MODAL_PATH
      service.ctrl = ctrl
      $event.shout("Modal.open", { url: url, scope: ctrl })

    close: (data) ->
      service.url = null
      service.ctrl = null
      $event.shout("Modal.close", data)

    getController: ->
      return service.ctrl

  return service

nawlsDir.directive "modalHolder", ($modal, $timeout) ->
    return {
      restrict: "A"
      scope: {}
      template: "<div id=\"modalHolder\" class=\"ng-cloak\" ng-show=\"modalURL\">" +
                  "<div class=\"modal fade\" ng-click=\"close()\" style=\"display:block\">" +
                    "<div class=\"modal-dialog\" ng-click=\"stopClickThrough($event)\" ng-include=\"modalURL\"></div>" +
                  "</div>" +
                  "<div class=\"modal-backdrop fade\" ng-click=\"close()\"></div>" +
                "</div>"
      link: (scope, element, attrs) ->
        scope.modalURL = $modal.url
        scope.close = ->
          $('body').removeClass('modal-open')
          $("#modalHolder").children().removeClass("in")
          scope.modalURL = null

        scope.$on "Modal.open", ->
          scope.modalURL = $modal.url
          $('body').addClass('modal-open')
          $timeout(() ->
            $("#modalHolder").children().addClass("in")
          , 50)

        scope.$on "Modal.close", scope.close
        scope.stopClickThrough = (event) ->
          event.stopImmediatePropagation()
    }