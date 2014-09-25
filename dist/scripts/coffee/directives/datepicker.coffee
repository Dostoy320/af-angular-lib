myApp = angular.module('af.datePicker', ['af.config'])

#
# <input type="text" date-picker ng-model="myDate" date-picker-config="myDateConfig"/>
#
myApp.directive 'datePicker', ($parse, $timeout, $util, $config)->
  return {
  require: 'ngModel'
  restrict:'A'
  transclude:false
  compile: (element, attrs) ->
    # create ui input
    modelAccessor = $parse(attrs.ngModel)
    element.attr('readonly', true) # no keyboards on mobile (but breaks tabbing) :(
    if $util.isMobile() then element.attr('type', 'date')

    return (scope, element, attrs, controller) ->

      # config
      config = {}
      if scope[attrs.datePickerConfig]
        config = scope[attrs.datePickerConfig]

      # will default to mm/dd/yy
      if not config.dateFormat and $config.get('app.dateFormatDatePicker')
        config.dateFormat = $config.get('app.dateFormatDatePicker')

      defaultConfig = {
        inline:true
        changeMonth:true
        changeYear:true
        selectOtherMonths:true
        showOtherMonths:true
        prevText:''
        nextText:''
      }
      datePickerConfig = _.defaults(config, defaultConfig)


      #
      # MOBILE
      #
      if $util.isMobile()

        element.blur () ->
          date = element.val()
          console.log 'blur', date
          scope.$apply (scope) ->
            modelAccessor.assign(scope, moment(date).toISOString())

        applyMobileValue = () ->
          value = modelAccessor(scope)
          if not moment.isMoment(value) then newDate = moment(value)
          element.attr('value', value.format('YYYY-MM-DD'))


        # watch for changes
        scope.$watch modelAccessor, (newValue, oldValue) ->
          if not newValue then return
          # accept a moment date
          newDate = newValue
          if not moment.isMoment(newValue)
            newDate = moment(newValue)
          element.attr('value', newDate.format('YYYY-MM-DD'))

        applyMobileValue()

        #
        # DESKTOP
        #
      else

        handleChange = () ->
          date = new Date(element.datepicker('getDate'))
          scope.$apply (scope) ->
            modelAccessor.assign(scope, date)

        updateUI = () ->
          element.blur()
          $timeout () ->
            element.blur()
            $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-next span').text('').addClass('glyphicon glyphicon-chevron-right')
            $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-prev span').text('').addClass('glyphicon glyphicon-chevron-left')
          , 1


        datePickerConfig.onChangeMonthYear = updateUI
        datePickerConfig.beforeShow = () ->
          updateUI()
          element.blur()
          $('#ui-datepicker-div').before('<div class="afDateInputModal modal-backdrop fade in"></div>')
          $('.afDateInputModal').click (event) ->
            event.stopImmediatePropagation()
            element.datepicker("hide")
            datePickerConfig.onClose()

        datePickerConfig.onClose = () ->
          handleChange()
          element.blur()
          $('.afDateInputModal').unbind('click')
          $('.afDateInputModal').remove()

        # init date picker
        element.datepicker(datePickerConfig)
        element.on 'click', (event) ->
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