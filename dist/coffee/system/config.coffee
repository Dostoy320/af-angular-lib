##
##
## config exposed from server
myApp = angular.module('nawlbergs.system')
myApp.service '$config', ($window) ->

  pluralize = (value) ->
    if not value then return value
    lastChar = value.charAt(value.length-1).toLowerCase()
    lastTwoChar = value.slice(value.length-2).toLowerCase()
    if lastChar is 'y' then return value.slice(0, value.length-1)+'ies'
    if lastTwoChar is 'ch' then return value+'es'
    return value + 's'

  # retrieves a nested value from an object via a string.
  # example path string: '2018.targets.total'
  getPathValue = (object, path) ->
    parts = path.split('.')
    if parts.length == 1 then return object[parts[0]]
    child = object[parts.shift()]
    if not child then return child
    return getPathValue(child, parts.join('.'))

  # service
  return {
    # eg ('label.goal', true)
    get:(path, makePlural) ->
      if !$window.config then return null # does it even exist?
      if !path then return $window.config # return everything.
      if path.indexOf('.') is -1 then path = 'label.'+path # if no parent... default to label object
      value = getPathValue($window.config, path)
      if makePlural
        pluralValue = getPathValue($window.config, path+'_plural') # does config contain plural value?
        if pluralValue then return pluralValue
        return pluralize(value)
      return value
  }