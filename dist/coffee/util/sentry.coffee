
myApp = angular.module('af.sentry')
myApp.service '$sentry', ($log, authManager) ->

    sentryIsLoaded = () ->
      if typeof Raven is "undefined" then return false
      # attach user info if possible
      if authManager and authManager.loggedInUser
        Raven.setUser({
          id: authManager.loggedInUser.userId,
          email: authManager.loggedInUser.userEmail
        });
      return true


    service =

      error : (name, extra) ->
        service.message(name, extra)

      message:(name, extra) ->
        if not sentryIsLoaded() then return $log.info 'Sentry Not loaded. Unable to send "'+name+'"'
        Raven.captureMessage(name, extra)

      exception:(error) ->
        if not sentryIsLoaded() then return $log.info 'Sentry Not loaded. Unable to send exception'
        Raven.captureException(error)

    return service