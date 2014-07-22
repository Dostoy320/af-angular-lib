#
# Msg Service
myApp = angular.module('nawlDirectives')
myApp.service '$msg', ($event, $log) ->
  msg = {

    shownAt:null
    minVisible:3

    # :: this is the main function to display our data
    show: (message, type, closable, delay) ->
      # set some defaults
      type ?= 'warning'
      if not _.isBoolean(closable) then closable = true
      if not _.isNumber(delay) or delay < msg.minVisible then delay = 0 # ensure valid delay
      if not closable and delay is 0 then delay = 3 # ensure delay exists if not closable

      msg.shownAt = new Date().getTime() # save when message was fired
      $event.shout($event.EVENT_msgShow, { message:message, type:type, delay:delay, closable:closable })

    # :: clear all system messages that are currently being shown
    clear:(force) ->
      # only clear something if its actually been viewed
      now = new Date().getTime();
      if force or (msg.shownAt and (now - msg.shownAt) > msg.minVisible)
        $event.shout($event.EVENT_msgClear)

    # :: easy makers
    alert:  (message, closable, delay) -> msg.show(message, 'warning', closable, delay)
    error:  (message, closable, delay) -> msg.show(message, 'danger',  closable, delay)
    info:   (message, closable, delay) -> msg.show(message, 'info',    closable, delay)
    success:(message, closable, delay) -> msg.show(message, 'success', closable, delay)
  }


## Msg UI
myApp.directive 'msgHolder', ($timeout, $window, $event, $log) ->

  timer = null # growl timer

  return {
    restrict: 'A'
    template:'<div class="app-alert" class="ng-cloak" style="position:fixed; top:0; left:0; right:0;">'+
                '<div class="animate-alert-animation container" ng-show="visible">'+
                  '<div class="alert" ng-class="cssClass">'+ # put on own div.. causing animation conflict
                    '<button type="button" class="close" ng-show="closable" ng-click="clear()">×</button>'+
                    '<span ng-bind-html="message"></span>'+
                  '</div>'+
                '</div>'+
              '</div>'
    link:(scope, element, attrs) ->
      # params
      scope.message = null
      scope.type = null
      scope.closable = null
      scope.visible = false

      scope.show = (message, type, closable, delay) ->
        scope.message = message
        scope.closable = closable
        scope.cssClass = if type then 'alert-'+type else 'alert-warning'
        if scope.closable then scope.cssClass += ' alert-dismissable'
        scope.visible = true
        # auto close?
        if timer then $timeout.cancel(timer)
        if _.isNumber(delay) and delay > 0
          timer = $timeout () ->
            scope.clear()
          , delay*1000

      scope.clear = () ->
        scope.visible = false
        if timer then $timeout.cancel(timer)

      scope.$on $event.EVENT_msgShow, (event, data) ->
        scope.show(data.message, data.type, data.closable, data.delay)
      scope.$on $event.EVENT_msgClear, scope.clear
    }