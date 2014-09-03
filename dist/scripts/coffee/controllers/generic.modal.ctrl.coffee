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


