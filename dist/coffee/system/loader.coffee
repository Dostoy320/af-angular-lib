## Loader Service
myApp = angular.module('af.loader', [])
myApp.service '$loader', ($event) ->
  return {
    start: (txt) ->  $event.shout($event.EVENT_loaderStart, txt)
    stop: () ->      $event.shout($event.EVENT_loaderStop)
  }

## Loader UI
myApp.directive 'loaderHolder', ($event) ->
  return {
    restrict: 'A'
    scope:{}
    template:
      '<div class="ng-cloak">'+
        '<div id="app-loader-bar" ng-cloak ng-show="loaderBar" class="ng-cloak progress progress-striped active">'+
          '<div class="progress-bar" style="width:100%"></div>'+
        '</div>'+
        '<div id="app-loader-mask" ng-show="loadMask">'+
          '<div class="loader-mask"></div>'+
          '<div class="loader-text">'+
            '<i class="icon-spinner icon-spin icon-3x"></i> &nbsp;<p ng-show="loaderText" ng-bind="loaderText"></p>'+
          '</div>'+
        '</div>'+
      '</div>'
    link:(scope, element, attrs) ->
      # params
      scope.loaderBar = null
      scope.loadMask = null
      scope.loaderText = null

      scope.start = (txt) ->
        scope.loaderText = if _.isString(txt) then txt else null
        scope.loadMask = if _.isBoolean(txt) or scope.loaderText then true else false
        scope.loaderBar = true

      scope.stop = () ->
        scope.loaderBar = scope.loaderText = scope.loadMask = null

      scope.$on $event.EVENT_loaderStart, (event, txt) ->
        scope.start(txt)
      scope.$on $event.EVENT_loaderStop, scope.stop
    }
