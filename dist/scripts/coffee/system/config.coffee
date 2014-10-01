##
##
## config exposed from server
myApp = angular.module('af.config', [])


myApp.service '$config', ($window, $log) ->

  app = null

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
  config = {

    setApp : (app) ->
      app = app

    # eg ('label.goal', true)
    get:(path, makePlural) ->
      if !$window.config then return null # does it even exist?
      if !path then return $window.config # return everything.
      value = getPathValue($window.config, path)
      if makePlural
        pluralValue = getPathValue($window.config, path+'_plural') # does config contain plural value?
        if pluralValue then return pluralValue
        return pluralize(value)
      return value

    # TENANT DATA
    getTenant:() ->
      config.get('app.tenant') # passed from php

    getEnv:() ->
      return appEnv.getEnv()

    getTenantIndex:() ->
      return appEnv.getTenantIndex()

    # DOMAIN / URL DATA
    getSubDomain : () ->
      return appEnv.getSubDomain()


    getApp : () ->
      if app then return app
      parts = $window.location.pathname.split('/')
      if parts.length >= 2 then app = (parts[1]).toLowerCase()
      return app

  }
  return config