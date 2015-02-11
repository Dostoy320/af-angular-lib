(function() {


  angular.module('af.bsIcons', [])

  .directive('bsIcon', function() {
    return {
      compile:function(elm, attrs){
        angular.element(elm).addClass('ng-show-inline glyphicon glyphicon-' + attrs.bsIcon);
      }
    };
  })

  .directive("faIcon", function() {
    return {
      compile: function(elm, attrs) {
        switch((''+attrs.faIcon).toLowerCase()){
          case 'roadmap': attrs.faIcon = 'road'; break; //'map-marker';
          case 'assessment': attrs.faIcon = 'check-circle-o'; break;
          case 'quickcontent':
          case 'quick content':
            attrs.faIcon = 'file-text-o'; break;
          case 'export':  attrs.faIcon = 'file'; break;
          case 'pdf':     attrs.faIcon = 'file-pdf-o'; break;
          case 'rtf':     attrs.faIcon = 'file-word-o'; break;
          case 'csv':     attrs.faIcon = 'file-excel-o'; break;
        }
        angular.element(elm).addClass('ng-show-inline fa fa-' + attrs.faIcon);
      }
    };
  })

}).call(this);