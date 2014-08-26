

myApp = angular.module('af.sentry', ['af.authManager','af.config'])

myApp.constant('SENTRY_ENABLED', true)

myApp.service '$sentry', ($log, $window, authManager, $config, SENTRY_ENABLED) ->

    sentryIsLoaded = () ->
      if not SENTRY_ENABLED then return false
      if typeof Raven is "undefined" then return false
      # attach user info if possible
      if authManager and authManager.loggedInUser
        Raven.setUser({
          id: authManager.loggedInUser.userId,
          email: authManager.loggedInUser.userEmail
        })
      else
        Raven.setUser() # clear user
      return true


    service =
      error : (name, extra, tags) ->
        service.message(name, extra, tags)

      message : (name, extra, tags) ->
        if not sentryIsLoaded() then return $log.info('Sentry Not loaded. Unable to send message: '+name)
        options =
          extra:extra or {}
          tags:tags or {}
        options.extra.url = $window.location.url
        options.tags.env = $config.getEnv()
        options.tags.app = $config.getApp()
        options.tags.tenant = $config.getTenant()
        Raven.captureMessage(name, options)

      exception : (error) ->
        if not sentryIsLoaded() then return $log.info('Sentry Not loaded. Unable to send exception')
        Raven.captureException(error)

    return service