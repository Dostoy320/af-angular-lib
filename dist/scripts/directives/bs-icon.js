(function() {


  angular.module('af.bsIcons', [])

  .directive('bsIcon', function() {
    return {
      compile:function(elm, attrs){
        angular.element(elm).addClass('ng-show-inline glyphicon glyphicon-' + attrs.bsIcon);
      }
    };
  })

  .directive("faIcon", function() {
    return {
      compile: function(elm, attrs) {
        angular.element(elm).addClass('ng-show-inline fa fa-' + attrs.faIcon);
      }
    };
  })

}).call(this);
