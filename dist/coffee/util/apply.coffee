
# ::
# :: a safer version of $scope.$apply()
myApp = angular.module('af.apply')
myApp.factory 'apply', ($rootScope) ->
  return () ->
    if not $rootScope.$$phase then $rootScope.$apply()