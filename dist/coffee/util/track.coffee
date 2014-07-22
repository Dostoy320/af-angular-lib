

myApp = angular.module('af.track')
myApp.service '$track', ($log, authManager) ->

    init = () ->
      if typeof mixpanel is 'undefined' then return false
      # apply userID if possible
      if authManager.loggedInUser
        mixpanel.identify(authManager.loggedInUser.userId);
      return true

    service =
      event:(name, options) ->
        if not init()
          return $log.info('Mixpanel Not loaded. Unable to track event: '+name)
        mixpanel.track(name, options)

      register:(options) ->
        if not init() then return $log.info 'Mixpanel Not loaded. Unable to Register', options
        mixpanel.register(options);

    return service