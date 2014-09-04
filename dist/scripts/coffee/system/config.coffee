##
##
## config exposed from server
myApp = angular.module('af.config', [])

# set a default so our service doesnt blow up
myApp.constant('DEV_DOMAINS', {localhost:'alpha2', dev:'alpha2'})

myApp.service '$config', ($window, $log, DEV_DOMAINS) ->

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

    # TENANT DATA
    getTenant:() -> config.get('app.tenant') # passed from php

    getEnv:() ->
      env = 'prod'
      subDomain = config.getSubDomain()
      if subDomain.indexOf('alpha') > -1 then return 'dev'
      if subDomain.indexOf('-dev') > -1 then return 'dev'
      # check dev domains
      _.each DEV_DOMAINS, (devNodeIndex, devDomain) ->
        if subDomain is devDomain then env = 'dev'
      return env;

    getTenantIndex:() ->
      index = config.getTenant() # default to tenant
      subDomain = config.getSubDomain()
      # strip dev to get indexes...
      if subDomain.indexOf('-dev') > -1 then subDomain = subDomain.split("-dev").shift()
      switch subDomain
        when 'alpha'   then index = 'alpha'
        when 'alpha2'  then index = 'alpha2'
        when 'waddell' then index = 'wr'
        when 'tdai'    then index = 'td'
      # check dev domains
      _.each DEV_DOMAINS, (devNodeIndex, devDomain) ->
        if subDomain is devDomain then index = devNodeIndex
      return index


    # DOMAIN / URL DATA
    getSubDomain : () ->
      return (window.location.host).split('.').shift().toLowerCase()

    setApp : (app) ->
      app = app

    getApp : () ->
      if app then return app
      parts = $window.location.pathname.split('/')
      if parts.length >= 2 then app = (parts[1]).toLowerCase()
      return app

    getTheme : () ->
      #<link id="themeCSS" rel="stylesheet" type="text/css" href="client/static/css/app-blue.css" theme="blue" />
      themeCss = $('#themeCSS')
      if themeCss.length isnt 1 or not themeCss.attr('theme') then alert 'Cannot find the theme CSS file id="themeCSS" to deterime theme.'
      return themeCss.attr('theme')

    getThemePrimaryColor : () ->
      # anyone know a better way to do this?
      theme = config.getTheme()
      switch theme
        when 'blue' then return '#336699'
        when 'green' then return '#00b624'
      $log.info '$config.getThemePrimaryColor(): Theme Not Found. Default Primary Color Used.'
      return '#336699'

    getThemeSecondaryColor : () ->
      # anyone know a better way to do this?
      theme = config.getTheme()
      switch theme
        when 'blue' then return '#666'
        when 'green' then return '#666'
      $log.info '$config.getThemeSecondaryColor(): Theme Not Found. Default Secondary Color Used.'
      return '#666'
  }
  return config