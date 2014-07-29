myApp = angular.module('af.java', ['af.api'])
myApp.service 'java', ($http, api, authManager) ->

  java = {

    RoadmapService:{
      serviceUrl:'/RoadmapService'
      execute:(method, params, onSuccess, onError) ->
        # all RoadmapService calls should have a sessionToken on them (except login)
        params.sessionToken ?= authManager.sessionToken
        req =
          url: java.RoadmapService.serviceUrl + method
          data: params
        api.execute(req, onSuccess, onError)

      # services
      invoke:(params, onSuccess, onError) ->
        java.RoadmapService.execute('/invoke', params, onSuccess, onError)
    }


    AuthService:{
      serviceUrl:'/AuthService'
      execute:(method, params, onSuccess, onError) ->
        # all calls should have a sessionToken on them (except some fringe cases)
        if method isnt 'login' and method isnt 'loadtoken'
          params.sessionToken ?= authManager.sessionToken
        req =
          headers:{'Content-Type': 'application/x-www-form-urlencoded'}
          url: java.AuthService.serviceUrl + method
          data: params
        api.execute(req, onSuccess, onError)

      # services
      login:(username, password, onSuccess, onError) ->
        params =
          username:username
          password:password
        java.AuthService.execute('/login', params, onSuccess, onError)

      logout:(onSuccess, onError) ->
        java.AuthService.execute('/logout', {}, onSuccess, onError)

      validatesession:(onSuccess, onError) ->
        java.AuthService.execute('/validatesession', {}, onSuccess, onError)

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