

myApp = angular.module('af.track', ['af.authManager'])

myApp.constant('TRACK_ENABLED', true)

myApp.service '$track', ($log, authManager, TRACK_ENABLED) ->

    init = () ->
      if not TRACK_ENABLED then return false
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

      # options to send with all future events for this user
      register:(options) ->
        if not init() then return $log.info('Mixpanel Not loaded. Unable to Register', options)
        mixpanel.register(options);

    return service