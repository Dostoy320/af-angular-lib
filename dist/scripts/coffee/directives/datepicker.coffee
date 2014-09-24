myApp = angular.module('af.datePicker', ['af.config'])

myApp.directive 'datePicker', ($parse, $timeout, $config)->
  return {
  require: 'ngModel'
  restrict:'A'
  replace:true
  transclude:false
  compile: (element, attrs) ->
    # create ui input
    modelAccessor = $parse(attrs.ngModel)
    html = '<input type="text" id="' + attrs.id + '"></input>'
    newElm = $(html)
    element.replaceWith(newElm)

    return (scope, element, attrs, controller) ->

      if scope[attrs.datePickerConfig]
        config = scope[attrs.datePickerConfig]
      else
        config = {}

      if scope[attrs.datePickerFormat]
        config = scope[attrs.datePickerFormat]
      else if $config.get('app.dateFormatDatePicker')
        config.dateFormat = $config.get('app.dateFormatDatePicker')

      handleChange = () ->
        date = new Date(element.datepicker('getDate'))
        scope.$apply (scope) ->
          modelAccessor.assign(scope, date)

      updateUI = () ->
        $timeout () ->
          next = $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-next span').text('').addClass('glyphicon glyphicon-chevron-right')
          prev = $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-prev span').text('').addClass('glyphicon glyphicon-chevron-left')
        , 5


      defaultConfig = {
        inline:true
        onClose:() ->
          handleChange()
          $('.afDateInputModal').remove()
        changeMonth:true
        changeYear:true
        selectOtherMonths:true
        showOtherMonths:true
        onChangeMonthYear:updateUI
        prevText:''
        nextText:''
        beforeShow:() ->
          updateUI()
          element.after('<div class="afDateInputModal modal-backdrop fade in"></div>')
      }
      datePickerConfig = _.defaults(config, defaultConfig)

      # init date picker
      element.datepicker(datePickerConfig)

      getTime = (value) ->


        # watch for changes
      scope.$watch modelAccessor, (newValue, oldValue) ->
        if not newValue then return $.datepicker._clearDate(element)
        # accept a moment date
        if moment and moment.isMoment(newValue)
          newDate = newValue.toDate()
        else
          newDate = new Date(newValue)
        element.datepicker('setDate', newDate)

      scope.$on '$destroy', () ->
        element.datepicker( "destroy" );
        element.removeClass("hasDatepicker").removeAttr('id');

  }