(function() {
  var myApp;

  myApp = angular.module('af.datePicker', ['af.config']);

  myApp.directive('datePicker', function($parse, $timeout, $config) {
    return {
      require: 'ngModel',
      restrict: 'A',
      replace: true,
      transclude: false,
      compile: function(element, attrs) {
        var html, modelAccessor, newElm;
        modelAccessor = $parse(attrs.ngModel);
        html = '<input type="text" id="' + attrs.id + '" readonly="true"></input>';
        newElm = $(html);
        element.replaceWith(newElm);
        return function(scope, element, attrs, controller) {
          var config, datePickerConfig, defaultConfig, handleChange, updateUI;
          config = {};
          if (scope[attrs.datePickerConfig]) {
            config = scope[attrs.datePickerConfig];
          }
          if (scope[attrs.datePickerFormat]) {
            config = scope[attrs.datePickerFormat];
          } else if ($config.get('app.dateFormatDatePicker')) {
            config.dateFormat = $config.get('app.dateFormatDatePicker');
          }
          handleChange = function() {
            var date;
            date = new Date(element.datepicker('getDate'));
            return scope.$apply(function(scope) {
              return modelAccessor.assign(scope, date);
            });
          };
          updateUI = function() {
            return $timeout(function() {
              $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-next span').text('').addClass('glyphicon glyphicon-chevron-right');
              $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-prev span').text('').addClass('glyphicon glyphicon-chevron-left');
              return element.blur();
            }, 5);
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
            onClose: function() {
              handleChange();
              $('.afDateInputModal').unbind('click');
              return $('.afDateInputModal').remove();
            },
            beforeShow: function() {
              updateUI();
              $('#ui-datepicker-div').after('<div class="afDateInputModal modal-backdrop fade in"></div>');
              return $('.afDateInputModal').click(function() {
                return element.datepicker("show");
              });
            }
          };
          datePickerConfig = _.defaults(config, defaultConfig);
          element.datepicker(datePickerConfig);
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
            element.datepicker("destroy");
            return element.removeClass("hasDatepicker").removeAttr('id');
          });
        };
      }
    };
  });

}).call(this);
