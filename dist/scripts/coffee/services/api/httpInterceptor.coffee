myApp = angular.module('af.httpInterceptor', ['af.api', 'af.sentry','af.msg'])

myApp.factory "httpInterceptor", httpInterceptor = ($q, $injector, api, $window, $config, $msg, $log, $loader, $sentry) ->

  # private
  responseIsJsend = (response) ->
    return isObject(response) and response.hasOwnProperty('status')

  isObject = (item) ->
    return (typeof item is 'object')

  # public
  interceptor = {

    #
    # global request
    request: (request) ->
      # no method? assume POST
      request.method ?= 'POST'

      # append debug info for server errors
      appendDebug = request.appendDebug isnt false
      if appendDebug and isObject(request.data) and not request.data.debug
        api.addDebugInfo(request)

      return request


    #
    # global response handler
    response:(response) ->
      #console.log('RESPONSE!')
      # could still be an error
      if response.status isnt 200 or (responseIsJsend(response.data) and response.data.status isnt 'success')
        #console.log('error status')
        return interceptor.responseError(response)

      # if jsend.... just return the data
      if responseIsJsend(response) and response.data.data
        response.data = response.data.data

      return response



    # global error handler
    # to disable = $http.get(url, {ignoreExceptions:true}).success(function(result){})
    # to disable = $http.get(url, {ignoreExceptions:[404,501]}).success(function(result){})
    responseError: (response) ->
      # dont handle error if ignoreExceptions...
      ignore = response.config.ignoreExceptions
      if ignore is true or (_.isArray(ignore) and _.contains(ignore, response.status))
        return $q.reject(response)

      # handle error
      message = api.getErrorMessage(response.data, response.status)
      $sentry.error(message, {extra:'TODO'}) # TODO: used to return req object
      $msg.error(message)
      $loader.stop()
      console.log('ERROR!')
      $q.reject(response)

  }
  return interceptor