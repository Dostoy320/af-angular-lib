myApp = angular.module('af.datePicker', [])
myApp.directive 'datePicker', ($parse)->
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

        onchange = () ->
          date = new Date(element.datepicker('getDate'))
          scope.$apply (scope) ->
            modelAccessor.assign(scope, date)

        # init date picker
        element.datepicker({
          inline:true
          onClose:onchange
          onSelect:onchange
        })

        # watch for changes
        scope.$watch modelAccessor, (val) ->
          date = new Date(val)
          element.datepicker('setDate', date)



  }