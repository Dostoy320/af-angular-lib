
#
# :: dispatches events from root of application
# :: this really just provides a logger around events...
# :: because events can make things very confusing if you cant see whats going on.
myApp = angular.module('nawlbergs.system')
myApp.service '$event', ($rootScope, $log) ->

  logEvent = (eventName, data) ->
    # ignore these events cause they fire a lot
    suppress = [service.EVENT_loaderStart, service.EVENT_loaderStop, service.EVENT_msgClear]
    if _.indexOf(suppress, eventName) is -1
      $log.info 'EVENT FIRED: ' + eventName, data

  return service =
    # events
    EVENT_logout:       'Auth.logout'
    EVENT_login:        'Auth.login'
    EVENT_loaderStart:  'Loader.start'
    EVENT_loaderStop:   'Loader.stop'
    EVENT_msgClear:     'Msg.clear'
    EVENT_msgShow:      'Msg.show'

    # fire events from root of application
    shout:(eventName, data) ->
      logEvent(eventName, data)
      $rootScope.$broadcast(eventName, data)

    # trickle down.. requires scope
    broadcast:($scope, eventName, data) ->
      logEvent(eventName, data)
      $scope.$broadcast(eventName, data)

    # trickle event up.. requires scope
    emit:($scope, eventName, data) ->
      logEvent(eventName, data)
      $scope.$emit(eventName, data)


