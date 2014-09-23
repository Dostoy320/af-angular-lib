(function() {
  var myApp;

  myApp = angular.module('af.datePicker', []);

  myApp.directive('datePicker', function($parse) {
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
          var onchange;
          onchange = function() {
            var date;
            date = new Date(element.datepicker('getDate'));
            return scope.$apply(function(scope) {
              return modelAccessor.assign(scope, date);
            });
          };
          element.datepicker({
            inline: true,
            onClose: onchange,
            onSelect: onchange,
            onClick: onChange,
            changeMonth: true,
            changeYear: true
          });
          scope.$watch(modelAccessor, function(val) {
            var date;
            date = new Date(val);
            return element.datepicker('setDate', date);
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
