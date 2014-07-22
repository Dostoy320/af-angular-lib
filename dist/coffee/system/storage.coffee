#
# storage for our apps
myApp = angular.module('nawlbergs.system')
myApp.service '$storage', (STORAGE_PREFIX) ->

  service =
    _prefix: STORAGE_PREFIX+'_'
    _prefixPersistent: 'p_'+STORAGE_PREFIX

    # will store a value under the key for this app, can be json, string, anything
    # expires is based on milliseconds
    store: (key, value, expires) ->
      amplify.store(@_prefix + key, value, {expires:expires})

    # will store a value under a special prefix so it will not be wiped when clear() is called
    persist: (key, value, expires) ->
      amplify.store(@_prefixPersistent + key, value, {expires:expires})

    # return all app specific data
    all: () ->
      appData = {}
      _.each amplify.store(), (value, key) ->
        if service.isAppData(key) or service.isPersistantAppData(key)
          appData[key] = value
      return appData

    # removes everything currently stored unless it was stored in persistent storage
    clear: (key) ->
      _.each amplify.store(), (value, key) ->
        if service.isAppData(key)
          amplify.store(key, null)

    # remove everything, even the persistent stuff
    nuke: () ->
      _.each amplify.store(), (value, key) ->
        if service.isAppData(key) or service.isPersistantAppData(key)
          amplify.store(key, null)

    # checks if data is tied to app
    isAppData: (key) ->           return key.indexOf(@_prefix) is 0
    isPersistantAppData: (key) -> return key.indexOf(@_prefixPersistent) is 0

  return service