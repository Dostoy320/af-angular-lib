myApp = angular.module('af.datePicker', ['af.config'])

#
# <input type="text" date-picker ng-model="myDate" date-picker-config="myDateConfig"/>
#
myApp.directive 'datePicker', ($parse, $timeout, $config)->
  return {
  require: 'ngModel'
  restrict:'A'
  transclude:false
  compile: (element, attrs) ->
    # create ui input
    modelAccessor = $parse(attrs.ngModel)
    element.attr('readonly', true) # no keyboards on mobile (but breaks tabbing) :(

    $util.isMo

    return (scope, element, attrs, controller) ->

      element.attr('type', 'date')
      return;
      config = {}
      if scope[attrs.datePickerConfig]
        config = scope[attrs.datePickerConfig]

      # will default to mm/dd/yy
      if not config.dateFormat and $config.get('app.dateFormatDatePicker')
        config.dateFormat = $config.get('app.dateFormatDatePicker')

      handleChange = () ->
        date = new Date(element.datepicker('getDate'))
        scope.$apply (scope) ->
          modelAccessor.assign(scope, date)

      updateUI = () ->
        #element.blur()
        #$timeout () ->
        #  #element.blur()
        #  $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-next span').text('').addClass('glyphicon glyphicon-chevron-right')
        #  $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-prev span').text('').addClass('glyphicon glyphicon-chevron-left')
        #, 1

      handleClose = () ->
        handleChange()
      #element.blur()
      #$('.afDateInputModal').unbind('click')
      #$('.afDateInputModal').remove()


      # config
      defaultConfig = {
        inline:true
        changeMonth:true
        changeYear:true
        selectOtherMonths:true
        showOtherMonths:true
        onChangeMonthYear:updateUI
        prevText:''
        nextText:''
        onClose:handleClose
        beforeShow:() ->
          #updateUI()
          #element.blur()
          #$('#ui-datepicker-div').before('<div class="afDateInputModal modal-backdrop fade in"></div>')
          #$('.afDateInputModal').click (event) ->
          #  event.stopImmediatePropagation()
          #  element.datepicker("hide")
          #  handleClose()

      }
      datePickerConfig = _.defaults(config, defaultConfig)

      # init date picker
      element.datepicker(datePickerConfig)
      element.on 'click', (event) ->
        console.log 'wtf'
        event.stopImmediatePropagation()
        element.datepicker("show")

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
        $('.afDateInputModal').unbind('click')
        element.datepicker( "destroy" );
        element.removeClass("hasDatepicker").removeAttr('id');

  }