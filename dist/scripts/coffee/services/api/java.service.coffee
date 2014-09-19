myApp = angular.module('af.java', ['af.api','af.authManager'])
myApp.service 'java', ($http, api, authManager) ->

  autoApplySession = true
  autoApplySessionPriority = null # passing ['amplify','url','window'] will specify the order the api looks for token

  java = {

    setAutoApplySession:(value) -> autoApplySession = value
    setAutoApplySessionPriority:(value) -> autoApplySessionPriority = value

    RoadmapService:{

      serviceUrl:'/RoadmapService'

      execute:(method, params, options) ->
        # all RoadmapService calls should have a sessionToken
        if autoApplySession
          params.sessionToken ?= authManager.findSessionToken(autoApplySessionPriority)
        reqDefaults =
          method:'POST'
          url: java.RoadmapService.serviceUrl + method
          data: params
        req = _.defaults(options or {}, reqDefaults)
        return $http(req)

      # services
      invoke:(params, options) ->
        return @execute('/invoke', params, options)
    }


    AuthService:{

      serviceUrl:'/RoadmapService'

      execute:(method, params, options) ->
        # all calls should have a sessionToken on them (except some fringe cases)
        if autoApplySession and method isnt '/login' and method isnt '/loadtoken'
          params.sessionToken ?= authManager.findSessionToken(autoApplySessionPriority)
        reqDefaults =
          method:'POST'
          headers:{ 'Content-Type' : 'application/x-www-form-urlencoded'}
          url: java.AuthService.serviceUrl + method
          data:$.param(params)
        # build request
        req = _.defaults(options or {}, reqDefaults)
        return $http(req)

      ##
      ## HELPERS
      login:(username, password) ->
        params =
          username:username
          password:password
        return @execute('/login', params, {ignoreExceptions:true})

      logout:() ->
        return @execute('/logout', null)

      validatesession:(sessionToken) ->
        params = {}
        # if no sessionToken passed in, service just validates logged in user
        if sessionToken then params.sessionToken = sessionToken
        return @execute('/validatesession', params)

      createtoken:(loginAsUserId, expiresOn, url) ->
        params =
          loginAsUserId:loginAsUserId
          expiresOn:expiresOn # isoDateString
          url:url
        return @execute('/createtoken', params)

      updatetoken:(tokenString, url) ->
        params =
          tokenString:tokenString
          url:url
        return @execute('/updatetoken', params)

      loadtoken:(token) ->
        return @execute('/loadtoken', { token:token })

      changepassword:(userId, currentPassword, newPassword) ->
        params =
          userId:userId
          currentPassword:currentPassword
          newPassword:newPassword
        return @execute('/changepassword', params)

      getuserfromuserid:(userId, sessionToken) ->
        return @execute('/getuserfromuserid', { userId:userId, sessionToken:sessionToken })

      loadsession:(sessionToken) ->
        return @execute('/loadsession', { sessionToken:sessionToken })

    }

  }

  return java