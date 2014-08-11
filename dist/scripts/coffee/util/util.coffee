
#
# util/misc functions for our apps
myApp = angular.module('af.util', ['af.config'])


Number::formatNumber = (precision, decimal, seperator) ->
  n = this
  precision = (if isNaN(precision = Math.abs(precision)) then 0 else precision)
  decimal = (if decimal is `undefined` then "." else decimal)
  seperator = (if seperator is `undefined` then "," else seperator)
  s = (if n < 0 then "-" else "")
  i = parseInt(n = Math.abs(+n or 0).toFixed(precision)) + ""
  j = (if (j = i.length) > 3 then j % 3 else 0)
  s + ((if j then i.substr(0, j) + seperator else "")) + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + seperator) + ((if precision then decimal + Math.abs(n - i).toFixed(precision).slice(2) else ""))


myApp.service '$util', ($window, $config, $location) ->

  return util = {

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


    getSubDomain : () ->
      return (window.location.host).split('.').shift()


    # axaj/client side post data to new window
    postToUrl : (url, params, newWindow, method) ->
      # new window? post or get?
      if not _.isBoolean(newWindow) then newWindow = true
      method = method or 'post'

      # create a form to submit our data to a new window
      form = document.createElement("form")
      form.setAttribute("method", method)
      form.setAttribute("action", url)

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


    format:{

      date:(value, format) ->
        if !value then return ''
        if moment # requires moment.js
          if !format then format = $config.get('app.dateFormat') or 'MM/DD/YY'
          if typeof value is 'string'
            date = moment(value, "YYYY-MM-DDTHH:mm:ss ZZ") # utc mode for timeshift
            return date.format(format)
          else
            return moment(value).format(format)
        return value

      number:(value, precision) ->
        return parseFloat(value).formatNumber(precision); # call our custom number formatter (see top of page)

      currency:(value, precision) ->
        return '$' + util.number(value, precision)

      percent:(value, precision) ->
        return util.number(value*100, precision)+'%'

    }
  }