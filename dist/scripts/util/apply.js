(function() {

  angular.module('af.apply', [])

  .factory('apply', function($rootScope) {
    return function() {
      if (!$rootScope.$$phase) {
        return $rootScope.$apply();
      }
    };
  });

}).call(this);
