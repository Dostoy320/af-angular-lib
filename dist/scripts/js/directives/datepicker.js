(function() {
  var myApp;

  myApp = angular.module('af.datePicker', ['af.config']);

  myApp.directive('datePicker', function($parse, $timeout, $util, $config) {
    return {
      require: 'ngModel',
      restrict: 'A',
      transclude: false,
      compile: function(element, attrs) {
        var modelAccessor;
        modelAccessor = $parse(attrs.ngModel);
        element.attr('readonly', true);
        if ($util.isMobile()) {
          element.attr('type', 'date');
        }
        return function(scope, element, attrs, controller) {
          var applyMobileValue, config, datePickerConfig, defaultConfig, handleChange, updateUI;
          config = {};
          if (scope[attrs.datePickerConfig]) {
            config = scope[attrs.datePickerConfig];
          }
          if (!config.dateFormat && $config.get('app.dateFormatDatePicker')) {
            config.dateFormat = $config.get('app.dateFormatDatePicker');
          }
          defaultConfig = {
            inline: true,
            changeMonth: true,
            changeYear: true,
            selectOtherMonths: true,
            showOtherMonths: true,
            prevText: '',
            nextText: ''
          };
          datePickerConfig = _.defaults(config, defaultConfig);
          if ($util.isMobile()) {
            element.blur(function() {
              var date;
              date = element.val();
              console.log('blur', date);
              return scope.$apply(function(scope) {
                return modelAccessor.assign(scope, moment(date).toISOString());
              });
            });
            applyMobileValue = function() {
              var newDate, value;
              value = modelAccessor(scope);
              if (!moment.isMoment(value)) {
                newDate = moment(value);
              }
              return element.attr('value', value.format('YYYY-MM-DD'));
            };
            scope.$watch(modelAccessor, function(newValue, oldValue) {
              var newDate;
              if (!newValue) {
                return;
              }
              newDate = newValue;
              if (!moment.isMoment(newValue)) {
                newDate = moment(newValue);
              }
              return element.attr('value', newDate.format('YYYY-MM-DD'));
            });
            return applyMobileValue();
          } else {
            handleChange = function() {
              var date;
              date = new Date(element.datepicker('getDate'));
              return scope.$apply(function(scope) {
                return modelAccessor.assign(scope, date);
              });
            };
            updateUI = function() {
              element.blur();
              return $timeout(function() {
                element.blur();
                $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-next span').text('').addClass('glyphicon glyphicon-chevron-right');
                return $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-prev span').text('').addClass('glyphicon glyphicon-chevron-left');
              }, 1);
            };
            datePickerConfig.onChangeMonthYear = updateUI;
            datePickerConfig.beforeShow = function() {
              updateUI();
              element.blur();
              $('#ui-datepicker-div').before('<div class="afDateInputModal modal-backdrop fade in"></div>');
              return $('.afDateInputModal').click(function(event) {
                event.stopImmediatePropagation();
                element.datepicker("hide");
                return datePickerConfig.onClose();
              });
            };
            datePickerConfig.onClose = function() {
              handleChange();
              element.blur();
              $('.afDateInputModal').unbind('click');
              return $('.afDateInputModal').remove();
            };
            element.datepicker(datePickerConfig);
            element.on('click', function(event) {
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
          }
        };
      }
    };
  });

}).call(this);
