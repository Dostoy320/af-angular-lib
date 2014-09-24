(function() {
  var myApp;

  myApp = angular.module('af.datePicker', ['af.config']);

  myApp.directive('datePicker', function($parse, $timeout, $config) {
    return {
      require: 'ngModel',
      restrict: 'A',
      transclude: false,
      compile: function(element, attrs) {
        var modelAccessor;
        modelAccessor = $parse(attrs.ngModel);
        element.attr('readonly', true);
        $util.isMo;
        return function(scope, element, attrs, controller) {
          var config, datePickerConfig, defaultConfig, handleChange, handleClose, updateUI;
          element.attr('type', 'date');
          return;
          config = {};
          if (scope[attrs.datePickerConfig]) {
            config = scope[attrs.datePickerConfig];
          }
          if (!config.dateFormat && $config.get('app.dateFormatDatePicker')) {
            config.dateFormat = $config.get('app.dateFormatDatePicker');
          }
          handleChange = function() {
            var date;
            date = new Date(element.datepicker('getDate'));
            return scope.$apply(function(scope) {
              return modelAccessor.assign(scope, date);
            });
          };
          updateUI = function() {};
          handleClose = function() {
            return handleChange();
          };
          defaultConfig = {
            inline: true,
            changeMonth: true,
            changeYear: true,
            selectOtherMonths: true,
            showOtherMonths: true,
            onChangeMonthYear: updateUI,
            prevText: '',
            nextText: '',
            onClose: handleClose,
            beforeShow: function() {}
          };
          datePickerConfig = _.defaults(config, defaultConfig);
          element.datepicker(datePickerConfig);
          element.on('click', function(event) {
            console.log('wtf');
            event.stopImmediatePropagation();
            return element.datepicker("show");
          });
          scope.$watch(modelAccessor, function(newValue, oldValue) {
            var newDate;
            if (!newValue) {
              return $.datepicker._clearDate(element);
            }
            if (moment && moment.isMoment(newValue)) {
              newDate = newValue.toDate();
            } else {
              newDate = new Date(newValue);
            }
            return element.datepicker('setDate', newDate);
          });
          return scope.$on('$destroy', function() {
            $('.afDateInputModal').unbind('click');
            element.datepicker("destroy");
            return element.removeClass("hasDatepicker").removeAttr('id');
          });
        };
      }
    };
  });

}).call(this);
