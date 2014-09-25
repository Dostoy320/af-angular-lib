#
#
myApp = angular.module('af.modal', ['af.event'])

# set a default so our service doesnt blow up
myApp.constant('DEFAULT_MODAL_PATH', 'src/views/templates/generic.modal.view.php')

myApp.service "$modal", ($event, DEFAULT_MODAL_PATH) ->
  service =

    url: null
    modalScope: null   # holds ctrl that opened modal
    parentScope: null  # holds ctrl of modal

    open: (url, parentScope, modalScope) ->
      service.url = url
      service.modalScope = modalScope
      service.parentScope = parentScope
      if not service.url then service.url = DEFAULT_MODAL_PATH
      $event.shout("Modal.open", { url: service.url, parentScope:service.parentScope, modalScope:modalScope  })

    close: (data) ->
      service.url = null
      #service.modalScope = null
      $event.shout("Modal.close", data)

    getModalScope: () -> return service.modalScope  # return ctrl of modal
    getParentScope: -> return service.parentScope    # return ctrl that opened modal

    updateModalScope:(scope) -> service.modalScope = scope


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
  $modal.open('client/views/analyzers/client.profitability.settings.php', $scope, {
    clickClose:() ->
      parentScope = $modal.getParentScope()
      modalScope = $modal.getModalScope()
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
    init:() -> foo = 'override this'
    run:() -> foo = 'override this'

  # build the scope
  _.extend($scope, defaultController, $modal.getModalScope())
  # push scope back into $modal after extended
  # this allows us to grab it from outside of this controller
  $modal.updateModalScope($scope)

  # call init on scope
  $scope.init()

  # runs after everything has loaded...
  $scope.$watch 'foobar', () ->
    $scope.run()
