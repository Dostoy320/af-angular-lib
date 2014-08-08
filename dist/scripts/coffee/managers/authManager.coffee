myApp = angular.module('af.authManager', [])
myApp.service 'authManager', ($util)->

  auth =

    # ::
    # :: CACHED DATA
    loggedInUser: {
      userName:   amplify.store("userName"),
      userId:     amplify.store("userId"),
      userEmail:  amplify.store("userEmail"),
      authorities:amplify.store("authorities")
    }
    sessionToken: amplify.store('sessionToken')

    clearUser:() ->
      amplify.store('username', null)
      amplify.store('userId', null)
      amplify.store('userEmail', null)
      amplify.store('authorities', null)
      amplify.store('sessionToken', null)
      auth.loggedInUser = null
      auth.sessionToken = null

    setSessionToken:(token) ->
      amplify.store('sessionToken', token)
      auth.sessionToken = token

    setLoggedInUser:(user) ->
      fields = _.pick(user, 'userName','userId','userEmail','authorities')
      auth.loggedInUser = fields
      _.each fields, (field) ->
        amplify.store(field, user[field])

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
        if auth.hasRole(role) then matched++
      return matched > 0

    hasAllRoles:(array) ->
      matched = 0
      _.each array, (role) ->
        if auth.hasRole(role) then matched++
      return array.length is matched

    isAdmin:() ->
      return auth.hasAnyRole(['Role_Admin', 'Role_RoadmapUserAdmin', 'Role_RoadmapContentAdmin'])

    isManager:() ->
      return auth.hasAnyRole(['Role_AccessKeyManager'])


    # ::
    # :: LOGGED IN?
    loggedIn:() ->
      return (auth.loggedInUser and auth.sessionToken)