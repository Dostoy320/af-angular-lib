myApp = angular.module('af.api', ['af.msg','af.loader','af.sentry','af.util','af.config'])


myApp.service 'api', ($window, $log, $msg, $loader, $sentry, $util, $config) ->

  return api =

    # add debugs info to requests (don't do on Java, Java could blow up)
    addDebugInfo:(req) ->
      req.data.debug =
        url:$window.location.href
        index:$config.getTenantIndex()
        tenant:$config.getTenant()
        env:$config.getEnv()
      return req


    ##
    ##
    ## ERROR HANDLING
    handleApiError:(data, status, headers, config) ->
      request = _.omit(config or {}, 'transformRequest','transformResponse')
      message = api.getErrorMessage(data, status)

      # convert urlEncoded to json
      if request.headers and request.headers['Content-Type'] is 'application/x-www-form-urlencoded'
        newData = {}
        queries =  (request.data + '').split("&")
        _.each queries, (part, i) ->
          temp = queries[i].split('=')
          if temp.length = 2 then newData[temp[0]] = temp[1]
        request.data = newData
      # strip password
      if request and request.data and request.data.password then request.data.password = '********' # no

      # log it and show to user
      $sentry.error(message, {extra: request})
      $log.error(message, status)
      $msg.error(message)
      $loader.stop()


    ## takes a server response and attempts to make it readable
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