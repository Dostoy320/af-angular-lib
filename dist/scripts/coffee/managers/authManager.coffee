myApp = angular.module('af.authManager', ['af.util'])
myApp.service 'authManager', ($util)->

  auth =

    # ::
    # :: CACHED DATA
    loggedInUser: amplify.store("loggedInUser")
    sessionToken: amplify.store('sessionToken')

    clearUser:() ->
      amplify.store('loggedInUser', null)
      amplify.store('sessionToken', null)
      auth.loggedInUser = null
      auth.sessionToken = null

    setSessionToken:(sessionToken) ->
      auth.sessionToken = sessionToken
      amplify.store('sessionToken', sessionToken)

    setLoggedInUser:(sessionToken, userId, userName, userEmail, authorities) ->
      auth.setSessionToken(sessionToken) = sessionToken
      auth.loggedInUser =
        userId:userId
        userName:userName
        userEmail:userEmail
        authorities:authorities
      amplify.store('loggedInUser', auth.loggedInUser)

    # looks for our sessionToken
    findSessionToken:(priority) ->
      # order to look for our token
      token = null
      if !priority then priority = ['app','amplify','url','window']
      _.each priority, (place) ->
        if token then return
        switch(place)
          when 'app'     then token = auth.sessionToken
          when 'amplify' then token = amplify.store('sessionToken')
          when 'url'     then token = $util.GET('sessionToken')
          when 'window'  then token = window.sessionToken
        return token
      return token



    # ::
    # :: ROLE CHECKERS
    hasRole:(role) ->
      if not auth.loggedIn() then return false
      return _.contains(auth.loggedInUser.authorities, role)

    hasAnyRole:(array) ->
      matched = 0
      _.each array, (role) ->
        if auth.hasRole(role) then matched += 1
      return matched > 0

    hasAllRoles:(array) ->
      matched = 0
      _.each array, (role) ->
        if auth.hasRole(role) then matched += 1
      return array.length is matched

    isAdmin:() ->
      return auth.hasAnyRole(['Role_Admin', 'Role_RoadmapUserAdmin', 'Role_RoadmapContentAdmin'])

    isManager:() ->
      return auth.hasAnyRole(['Role_AccessKeyManager'])


    # ::
    # :: LOGGED IN?
    loggedIn:() ->
      return (auth.sessionToken and auth.loggedInUser.userId)