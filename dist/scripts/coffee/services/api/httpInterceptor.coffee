myApp = angular.module('af.httpInterceptor', ['af.api', 'af.sentry','af.msg'])

myApp.factory "httpInterceptor", httpInterceptor = ($q, $injector, api, $window, $config) ->

  # private
  responseIsJsend = (response) ->
    return isObject(response) and response.hasOwnProperty('status')

  isObject = (item) ->
    return (typeof item is 'object')

  getExtension = (url) ->
    return url.split('.').pop();


  # public
  interceptor = {

    #
    # global request setup
    request: (config) ->
      ext = getExtension(config.url)
      if ext is 'php' or ext is 'html'
        return config
      # no method? assume POST
      config.method ?= 'POST'
      # append debug info for server errors
      appendDebug = config.appendDebug isnt false
      if appendDebug and isObject(config.data) and not config.data.debug
        api.addDebugInfo(config)
      return config


    #
    # global response handler
    response:(response) ->
      # could still be an error
      if response.status isnt 200 or (responseIsJsend(response.data) and response.data.status isnt 'success')
        return interceptor.responseError(response)
      # if jsend, just return the data
      if responseIsJsend(response) and isObject(response.data) and response.data.hasOwnProperty('data')
        response.data = response.data.data
      return response



    # global error handler
    # to disable = $http.get(url, {ignoreExceptions:true}).success(function(result){})
    # to disable = $http.get(url, {ignoreExceptions:[404,501]}).success(function(result){})
    responseError: (response) ->
      # don't handle error if ignoreExceptions...
      ignore = response.config.ignoreExceptions
      if ignore is true or (_.isArray(ignore) and _.contains(ignore, response.status))
        return $q.reject(response)
      api.handleApiError(response.data, response.status, response.headers, response.config)
      $q.reject(response)

  }
  return interceptor