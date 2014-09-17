
/*
myApp = angular.module('af.httpInterceptor', ['af.api','af.authManager', 'af.loader', 'af.sentry','af.util','af.config'])

myApp.factory "httpInterceptor", httpInterceptor = ($q, $injector, $loader, authManager) ->
  $modal = undefined
  request: (config) ->
    console.log 'request'
    if !config.loader
      $loader.start(config.loaderMsg or 'Loading...')
     *url = config.url
     *if not url.endsWith(".html") and not url.startsWith("http") and not url.startsWith("//")
     *  url = APP_CONFIG.baseApiUrl + url
     *  config.url = url
    config.url = 'test'
    return config


   * global error handler
   * to disable = $http.get(url, {ignoreExceptions:true}).success(function(result){})
  responseError: (response) ->
     * dont handle error if ignore....
    ignore = response.config.ignoreExceptions
    if ignore is true or (_.isArray(ignore) and _.contains(ignore, response.status))
      return $q.reject(response)

     * display error message...
    if !$modal then $modal = $injector.get("$modal")

    errorMessage =
      title: ""
      subTitle: ""
      detail: ""

    switch response.status
      when 500
        errorMessage.title = "500 - Internal Server Error"
      when 400
        errorMessage.title = "400 - Bad Request"
      when 403
        errorMessage.title = "403 - Forbidden"
      when 404
        errorMessage.title = "404 - Not Found"
      when 401
        errorMessage.title = "401 - Unauthorized"
         *authManager.clearUser()
      else
        errorMessage.title = response.status + " - Unknown Error"

    if response.config.action
      errorMessage.subTitle = "Failed Action: " + response.config.action

    if angular.isObject(response.data)
      errorMessage.detail = JSON.stringify(response.data)
    else
      errorMessage.detail = response.data #.escapeHTML()

    $modal.open
      templateUrl: "app/modals/error-message.html"
      controller: "ErrorMessageCtrl"
      resolve:
        errorMessage: ->
          errorMessage

    $q.reject response
 */

(function() {


}).call(this);
