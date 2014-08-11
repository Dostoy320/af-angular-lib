myApp = angular.module('af.api', ['af.msg','af.loader','af.config','af.sentry'])
myApp.service 'api', ($http, $msg, $window, $log, $loader, $config, $sentry) ->

  return api =

    ##
    ## common getters
    getEnv:() -> $config.get('app.env')
    getTenant:() -> $config.get('app.tenant')
    getTenantIndex:() ->
      index = api.getTenant() # default to tenant
      subDomain = $window.location.hostname.split('.').shift()
      switch subDomain
        when 'alpha2', 'dev', 'localhost' then index = 'alpha2'
        when 'alpha'   then index = 'alpha'
        when 'waddell' then index = 'wr'
        when 'tdai'    then index = 'td'
      return index


    ##
    ## GLOABAL REQUEST EXECUTION
    execute:(req, onSuccess, onError) ->
      req.method ?= 'POST'
      $http(req)
        .success (data, status) ->
          # could still be an error response
          if status isnt 200 or (data and data.status and data.status isnt 'success')
            if onError then return onError(data, status, req)
            return api.handleApiError(data, status, req)
          # SUCCESS! return it?
          if onSuccess
            if data and data.hasOwnProperty('data') and data.hasOwnProperty('status')
              return onSuccess(data.data, status, req) # JSEND.. return data.data
            return onSuccess(data, status, req) # return everything
        .error (data, status) ->
          api.handleApiError(data, status, req)

    ##
    ## ERROR HANDLING
    handleApiError:(data, status, req) ->
      message = api.getErrorMessage(data, status)
      if req and req.data and req.data.password then req.data.password = '********' # no
      # log it and show to user
      $sentry.error(message, {extra: req})
      $log.error(message, status)
      $msg.error(message)
      $loader.stop()

    ##
    ## takes a server resonse and attempts to make it readible
    getErrorMessage:(data, status) ->
      # jsend error?
      if data and data.hasOwnProperty('message') and data.hasOwnProperty('code')
        codeStr = api.getHttpCodeString(data.code)
        if data.message is codeStr
          return data.message + ' (' + data.code + ')'
        else
          return data.message + ' (' + codeStr + ')'
      # http code?
      if _.isNumber(status) and api.isHttpCode(status)
        err = api.getHttpCodeString(status)
        if status is 502 then err = 'Unable to communicate with server. Please check your internet connection.'
        return err + ' (' + status + ')'
      # return whatever we can...
      return data.message or data.code or data or status

    # add debugs info to requests (dont do on Java, Java could blow up)
    addDebugInfo:(req) ->
      req.data.debug =
        url:$window.location.href
        index:api.getTenantIndex()
        tenant:api.getTenant()
        env:api.getEnv()
      return req


    ##
    ##
    ## Value Validations
    ensureInt: (value) ->
      if _.isString(value) then return parseInt(value)
      return value
    ensureBool: (value) ->
      if value is 'true' or 1 then return true
      if value is 'false' or 0 then return false
      return value
    ensureString: (value) -> return ''+value


    ##
    ##
    ## UTIL
    # resolve
    standardResolve: (defer, data) ->
      return (error) ->
        if error then defer.reject(error) else defer.resolve(data)
    standardAsyncErr:(next, data, status) ->
      return next(api.getErrorMessage(data, status))

    # determine if code is a common one...
    isHttpCode : (code) -> return _.isString(api.getHttpCodeString(code))
    # common error codes
    getHttpCodeString : (code) ->
      http_codes =
        100:'Continue'
        101:'Switching Protocols'
        102:'Processing'
        200:'OK'
        201:'Created'
        202:'Accepted'
        203:'Non-Authoritative Information'
        204:'No Content'
        205:'Reset Content'
        206:'Partial Content'
        207:'Multi-Status'
        300:'Multiple Choices'
        301:'Moved Permanently'
        302:'Found'
        303:'See Other'
        304:'Not Modified'
        305:'Use Proxy'
        306:'Switch Proxy'
        307:'Temporary Redirect'
        400:'Bad Request'
        401:'Unauthorized'
        402:'Payment Required'
        403:'Forbidden'
        404:'Not Found'
        405:'Method Not Allowed'
        406:'Not Acceptable'
        407:'Proxy Authentication Required'
        408:'Request Timeout'
        409:'Conflict'
        410:'Gone'
        411:'Length Required'
        412:'Precondition Failed'
        413:'Request Entity Too Large'
        414:'Request-URI Too Long'
        415:'Unsupported Media Type'
        416:'Requested Range Not Satisfiable'
        417:'Expectation Failed'
        418:'I\'m a teapot'
        422:'Unprocessable Entity'
        423:'Locked'
        424:'Failed Dependency'
        425:'Unordered Collection'
        426:'Upgrade Required'
        449:'Retry With'
        450:'Blocked by Windows Parental Controls'
        500:'Internal Server Error'
        501:'Not Implemented'
        502:'Bad Gateway'
        503:'Service Unavailable'
        504:'Gateway Timeout'
        505:'HTTP Version Not Supported'
        506:'Variant Also Negotiates'
        507:'Insufficient Storage'
        509:'Bandwidth Limit Exceeded'
        510:'Not Extended'
      if http_codes.hasOwnProperty(code) then return http_codes[code]
      return code