myApp = angular.module('af.datePicker', [])
myApp.directive 'datePicker', ($parse, $timeout)->
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

      handleChange = () ->
        date = new Date(element.datepicker('getDate'))
        scope.$apply (scope) ->
          modelAccessor.assign(scope, date)

      # init date picker
      element.datepicker({
        inline:true
        onClose:handleChange
        changeMonth:true
        changeYear:true
      })

      # watch for changes
      scope.$watch modelAccessor, (newValue, oldValue) ->
        if (newValue and not oldValue) or (newValue.getTime() != oldValue.getTime())
          date = new Date(newValue)
          element.datepicker('setDate', date)

      scope.$on '$destroy', () ->
        element.datepicker( "destroy" );
        element.removeClass("hasDatepicker").removeAttr('id');

  }