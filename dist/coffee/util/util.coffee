
#
# util/misc functions for our apps
myApp = angular.module('af.util', [])
myApp.service '$util', ($window, $location) ->

  return service = {

    # Get a Search param out of the URL no matter where it is....
    GET : (key, defaultValue) ->
      # angular only looks after hash /#/route?foo=bar
      # php/server needs it before hash ?foo=bar/#/route
      # so we need to look in both
      vars = $location.search() # angualar
      search = $window.location.search # normal

      if search
        params = search.split('&')
        _.each params, (param, i) ->
          # strip off no-nos
          parts = param.replace('#', '').replace('/','').replace('?','').split('=')
          vars[parts[0]] = decodeURIComponent(parts[1])

      if key then return vars[key] || defaultValue
      return vars


    # axaj/client side post data to new window
    postToUrl : (url, params, newWindow, method) ->
      # new window? post or get?
      if not _.isBoolean(newWindow) then newWindow = true
      method = method or 'post'

      # create a form to submit our data to a new window
      form = document.createElement("form")
      form.setAttribute("method", method)
      form.setAttribute("action", action)

      # create a hidden form field for all our parameters
      _.each params, (key) ->
        type = typeof params[key]
        if type is 'function' or type is 'object' then return
        hiddenField = document.createElement("input")
        hiddenField.setAttribute("type", "hidden")
        hiddenField.setAttribute("name", key)
        hiddenField.setAttribute("value", params[key])
        form.appendChild(hiddenField)

      # submit form with a random namey thing
      if newWindow
        date = new Date() # grabbing the date as of this second it gets run
        winName = 'af_postWindow'+date.getTime() # random name to create new window each time
        window.open('', winName)
        form.target = winName
        document.body.appendChild(form)
        form.submit();
        document.body.removeChild(form)
      else
        document.body.appendChild(form);
        form.submit();
  }