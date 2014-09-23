(function() {
  var myApp;

  myApp = angular.module('af.datePicker', []);

  myApp.directive('datePicker', function($parse, $timeout) {
    return {
      require: 'ngModel',
      restrict: 'A',
      replace: true,
      transclude: false,
      compile: function(element, attrs) {
        var html, modelAccessor, newElm;
        modelAccessor = $parse(attrs.ngModel);
        html = '<input type="text" id="' + attrs.id + '"></input>';
        newElm = $(html);
        element.replaceWith(newElm);
        return function(scope, element, attrs, controller) {
          var handleChange;
          handleChange = function() {
            var date;
            date = new Date(element.datepicker('getDate'));
            return scope.$apply(function(scope) {
              return modelAccessor.assign(scope, date);
            });
          };
          element.datepicker({
            inline: true,
            onClose: handleChange,
            changeMonth: true,
            changeYear: true
          });
          scope.$watch(modelAccessor, function(newValue, oldValue) {
            var date;
            if ((newValue && !oldValue) || (newValue.getTime() !== oldValue.getTime())) {
              date = new Date(newValue);
              return element.datepicker('setDate', date);
            }
          });
          return scope.$on('$destroy', function() {
            element.datepicker("destroy");
            return element.removeClass("hasDatepicker").removeAttr('id');
          });
        };
      }
    };
  });

}).call(this);
