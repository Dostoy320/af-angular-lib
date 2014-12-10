(function() {
  var myApp = angular.module('af.bsIcons', []);

  myApp.directive('bsIcon', function() {
    return {
      compile:function(elm, attrs){
        angular.element(elm).addClass('ng-show-inline glyphicon glyphicon-' + attrs.bsIcon);
      }
    };
  });

  myApp.directive("faIcon", function() {
    return {
      compile: function(elm, attrs) {
        angular.element(elm).addClass('ng-show-inline fa fa-' + attrs.faIcon);
      }
    };
  });

}).call(this);
