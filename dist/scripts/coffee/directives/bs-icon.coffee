myApp = angular.module('af.bsIcons', [])
myApp.directive 'bsIcon', ()->
  return {
  scope:
    icon:'@bsIcon'
    color:'@bsIconColor'
  link:(scope, element, attrs) ->
    element.addClass('ng-show-inline glyphicon glyphicon-'+scope.icon)
    if scope.color then element.css('color', scope.color)
  }

myApp.directive "faIcon", () ->
  return {
  scope:
    icon:'@faIcon'
    color:'@faIconColor'
  link:(scope, element, attrs) ->
    element.addClass('ng-show-inline fa fa-'+scope.icon)
    if scope.color then element.css('color', scope.color)
  }