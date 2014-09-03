#
#
myApp = angular.module('af.modal', ['af.event'])

# set a default so our service doesnt blow up
myApp.constant('DEFAULT_MODAL_PATH', 'src/views/templates/generic.modal.view.php')

myApp.service "$modal", ($event, DEFAULT_MODAL_PATH) ->
  service =
    url: null
    scope: null

    open: (url, scope) ->
      service.url = url
      service.scope = scope
      if not service.url then service.url = DEFAULT_MODAL_PATH
      $event.shout("Modal.open", { url: service.url, scope:service.scope  })

    close: (data) ->
      service.url = null
      service.scope = null
      $event.shout("Modal.close", data)

    updateScope:(scope) ->
      service.scope = scope

    getScope: ->
      return service.scope

  return service

myApp.directive "modalHolder", ($modal, $timeout) ->
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



myApp.GenericModalCtrl = myApp.controller 'GenericModalCtrl', ($scope, $modal) ->

  ###
  Example usage
  $modal.open('client/views/analyzers/client.profitability.settings.php', {
    clickClose:() ->
      modalScope = $modal.getScope()
      # do something
      $modal.close()
  })
  ###

  # default scope
  # this is all overrideable
  defaultController =
    title:'Are you sure?'
    body:'Are you sure you wish to continue?'
    closeBtnLabel:'Close'
    confirmBtnLabel:null
    showbuttons:true
    clickClose: () ->  $modal.close()
    clickConfirm:() -> $modal.close()
    run:() -> foo = 'override this'

  init = () ->
    # build the scope
    _.extend($scope, defaultController, $modal.getScope())
    # push scope back into $modal after extended
    # this allows us to grab it from outside of this controller
    $modal.updateScope($scope)

  init()
  $scope.run()
