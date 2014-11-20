
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



myApp.service '$util', ($window, $location, $config) ->

  return util = {

    # if you pass an object and value it will get the nested path..
    # else.. checks direct value...
    exists:(value, path) ->
      if(typeof value == 'object' && typeof path == 'string')
        value = util.getNested(value, path)
      return (!_.isNull(value) and !_.isUndefined(value) && !_.isNaN(value))

    # safely gets nested values from an object that could contain nulls
    getNested:(object, path) ->
      # no object to search? were done...
      if not util.exists(object) then return null
      # end of path? were done...
      parts = path.split('.')
      if parts.length == 1 then return object[parts[0]]
      # no valid child? were done...
      child = object[parts.shift()]
      if not util.exists(child) then return null
      # continue search...
      return util.value(child, parts.join('.'))


    # Get a Search param out of the URL no matter where it is....
    GET : (key) ->
      # angular only looks after hash /#/route?foo=bar
      # php/server needs it before hash ?foo=bar#/route
      # so we need to look in both
      vars = $location.search() # angualar
      search = $window.location.search # normal
      if search
        params = search.split('&')
        _.each params, (param, i) ->
          # strip off no-nos
          parts = param.replace('#', '').replace('/','').replace('?','').split('=')
          vars[parts[0]] = decodeURIComponent(parts[1])
      if key
        if vars[key] then return vars[key]
        if vars[key.toLowerCase()] then return vars[key.toLowerCase()] # check for a lower case version
        return null
      return vars

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
      _.each params, (value, key) ->
        type = typeof value
        if type is 'function' or type is 'object' then return
        hiddenField = document.createElement("input")
        hiddenField.setAttribute("type", "hidden")
        hiddenField.setAttribute("name", key)
        hiddenField.setAttribute("value", value)
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


    isMobile:() ->
      check = false
      ((a) ->
        check = true  if /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) or /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))
        return
      ) navigator.userAgent or navigator.vendor or window.opera
      return check

    format:{

      date:(value, format, inputType) ->
        if !value then return ''
        if !inputType then inputType = "utc" # utc mode for timeshift
        if moment # requires moment.js
          if !format then format = $config.get('app.dateFormat') or 'MM/DD/YY'
          if typeof value is 'string'
            switch(inputType.toLowerCase())
              when 'utc' then inputType = "YYYY-MM-DDTHH:mm:ss ZZ"
              when 'asp' then inputType = null # "/Date(1198908717056-0700)/"
            return moment(value, inputType).format(format)
          else
            return moment(value).format(format)
        return value

      number:(value, precision) ->
        return parseFloat(value).formatNumber(precision); # call our custom number formatter (see top of page)

      currency:(value, precision) ->
        return '$' + util.format.number(value, precision)

      percent:(value, precision) ->
        return util.format.number(value*100, precision)+'%'

    }
  }