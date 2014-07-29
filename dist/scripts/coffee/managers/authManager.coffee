myApp = angular.module('af.authManager', [])
myApp.service 'authManager', ()->

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
      auth.loggedInUser = null
      auth.sessionToken = null


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