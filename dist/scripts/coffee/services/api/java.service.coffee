myApp = angular.module('af.java', ['af.api','af.authManager'])
myApp.service 'java', ($http, api, authManager) ->

  autoApplySession = true
  autoApplySessionPriority = null # passing ['amplify','url','window'] will specify the order the api looks for token

  java = {

    setAutoApplySession:(value) -> autoApplySession = value
    setAutoApplySessionPriority:(value) -> autoApplySessionPriority = value

    RoadmapService:{
      serviceUrl:'/RoadmapService'
      execute:(method, params, onSuccess, onError) ->
        # all RoadmapService calls should have a sessionToken
        if autoApplySession then params.sessionToken ?= authManager.findSessionToken(autoApplySessionPriority)
        req =
          url: java.RoadmapService.serviceUrl + method
          data: params
        api.execute(req, onSuccess, onError)

      # services
      invoke:(params, onSuccess, onError) ->
        java.RoadmapService.execute('/invoke', params, onSuccess, onError)
    }


    AuthService:{
      serviceUrl:'/RoadmapService'
      execute:(method, params, onSuccess, onError) ->
        # all calls should have a sessionToken on them (except some fringe cases)
        if autoApplySession and method isnt 'login' and method isnt 'loadtoken'
          params.sessionToken ?= authManager.findSessionToken(autoApplySessionPriority)
        req =
          headers:{'Content-Type': 'application/x-www-form-urlencoded'}
          url: java.AuthService.serviceUrl + method
          data: $.param(params)
        api.execute(req, onSuccess, onError)

      # services
      login:(username, password, onSuccess, onError) ->
        params =
          username:username
          password:password
        java.AuthService.execute('/login', params, onSuccess, onError)

      logout:(onSuccess, onError) ->
        java.AuthService.execute('/logout', {}, onSuccess, onError)

      validatesession:(sessionToken, onSuccess, onError) ->
        params = {}
        if sessionToken then params.sessionToken = sessionToken
        java.AuthService.execute('/validatesession', params, onSuccess, onError)

      createtoken:(loginAsUserId, expiresOn, url, onSuccess, onError) ->
        params =
          loginAsUserId:loginAsUserId
          expiresOn:expiresOn # isoDateString
          url:url
        java.AuthService.execute('/createtoken', params, onSuccess, onError)

      updatetoken:(tokenString, url, onSuccess, onError) ->
        params =
          tokenString:tokenString
          url:url
        java.AuthService.execute('/updatetoken', params, onSuccess, onError)

      loadtoken:(token, onSuccess, onError) ->
        java.AuthService.execute('/loadtoken', {token:token}, onSuccess, onError)

      changepassword:(userId, currentPassword, newPassword, onSuccess, onError) ->
        params =
          userId:userId
          currentPassword:currentPassword
          newPassword:newPassword
        java.AuthService.execute('/changepassword', params, onSuccess, onError)

      getuserfromuserid:(userId, onSuccess, onError) ->
        java.AuthService.execute('/getuserfromuserid', {userId:userId}, onSuccess, onError)

      loadsession:(sessionToken, onSuccess, onError) ->
        java.AuthService.execute('/loadsession', {sessionToken:sessionToken}, onSuccess, onError)

    }

  }

  return java