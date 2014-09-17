<!DOCTYPE html>
<html id="ng-app" class="ng-app:myApp" ng-app="myApp">
<head>
  <title>SandBox</title>
  <!-- Always force latest IE rendering engine -->
  <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
</head>

<body ng-controller="AppCtrl">

  <!-- APP -->
  <div id="app">
    <div ng-view></div>
  </div>

  <div msg-holder></div>
  <div modal-holder></div>
  <div loader-holder></div>

  <!-- LIBS -->
  <script type="text/javascript" src="../bower_components/angular/angular.js"></script>
  <script type="text/javascript" src="../dist/scripts/aflib.js"></script>
  <script type="text/javascript" src="app.js"></script>

</body>
</html>