module.exports = (grunt) ->

  # Default task(s).
  grunt.registerTask 'default', ['copy','coffee','less','concat','watch']



  # Project configuration.
  grunt.initConfig({
    # compile and concatenate Coffee
    coffee:{
      compile: {
        options: {join: true}
        files: {
          'client/static/js/libs/af-angular-lib.js':   'bower_components/af-angular-lib/dist/scripts/coffee/**/*.coffee'
          'client/static/js/app/app.js':               'client/*.coffee'
          'client/static/js/app/scripts-directives.js':'client/scripts/directives/**/*.coffee'
          'client/static/js/app/scripts-filters.js':   'client/scripts/filters/**/*.coffee'
          'client/static/js/app/scripts-managers.js':  'client/scripts/managers/**/*.coffee'
          'client/static/js/app/scripts-services.js':  'client/scripts/services/**/*.coffee'
          # app specific
          'client/static/js/app/ctrls.js':             'client/views/*.coffee',
        }
      }
    }
    # compile and concatenate CSS
    less: {
      compile: {
        files: {
          'client/static/css/app-blue.css':  'client/styles/themes/app-blue.less'
          'client/static/css/app-green.css': 'client/styles/themes/app-green.less'
        }
      }
    }
    # concatenate bower files
    concat:{
      setup:{
        options:{ separator:grunt.util.linefeed+';'+grunt.util.linefeed },
        nonull: true,
        dest:'client/static/js/libs/setup.js',
        src:[
          'bower_components/af-angular-lib/dist/setup/https-check.js',
          'bower_components/af-angular-lib/dist/setup/console-fix.js',
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/amplify/lib/amplify.core.min.js',
          'bower_components/amplify/lib/amplify.store.min.js',
          'bower_components/raven-js/dist/raven.min.js',
          'bower_components/af-angular-lib/dist/setup/sentry-setup.js',
        ]
      },
      libsdev:{
        options:{ separator:grunt.util.linefeed+';'+grunt.util.linefeed }
        nonull: true
        dest:'client/static/js/libs/libs.js'
        src:[
          # angular
          'bower_components/angular/angular.js'
          'bower_components/angular-sanitize/angular-sanitize.js'
          'bower_components/angular-animate/angular-animate.js'
          'bower_components/angular-ui-router/release/angular-ui-router.js'
          # ui
          'bower_components/bootstrap/dist/js/bootstrap.js' # causes ie7 to throw error with jquery > 1.7.2
          # util
          'bower_components/lodash/dist/lodash.js'
          'bower_components/moment/moment.js'
          'bower_components/async/lib/async.js'
          # forms
          'bower_components/jquery-validation/dist/jquery.validate.js'
        ]
      },
      libs:{
        options:{ separator:grunt.util.linefeed+';'+grunt.util.linefeed }
        nonull: true
        dest:'client/static/js/libs/libs.min.js'
        src:[
          # angular
          'bower_components/angular/angular.min.js'
          'bower_components/angular-sanitize/angular-sanitize.min.js'
          'bower_components/angular-animate/angular-animate.min.js'
          'bower_components/angular-ui-router/release/angular-ui-router.min.js'
          #ui
          'bower_components/bootstrap/dist/js/bootstrap.min.js'
          # util
          'bower_components/lodash/dist/lodash.min.js'
          'bower_components/moment/min/moment.min.js'
          'bower_components/async/lib/async.js'
          # forms
          'bower_components/jquery-validation/dist/jquery.validate.min.js'
        ]
      }
    }
    copy:{
      # this moves some bower files into our client folder..
      bower:{
        files:[
          # fonts
          {
            expand:true, flatten:true, filter:'isFile'
            src:[
              'bower_components/bootstrap/dist/fonts/**/*'
              'bower_components/font-awesome/fonts/**/*'
            ]
            dest:'client/static/fonts/'
          }
          # af-angular-lib
          {
            expand:true
            flatten:false
            cwd:'bower_components/af-angular-lib/dist/assets/img/'
            src:'**/*'
            dest:'client/static/img/'
          }
          {
            expand:true
            flatten:false
            cwd:'bower_components/af-angular-lib/dist/templates/'
            src:'**/*'
            dest:'client/static/templates/'
          }
          # respondJs for ie8
          {
            expand:true, flatten:true, filter:'isFile'
            src:'bower_components/respond/dest/respond.min.js'
            dest:'client/static/js/libs/'
          }
        ]
      }
    }
    watch: {
      misc: {
        files: ['**/*.php','**/*.png','**/*.jpg']
        options: { livereload: true }
      }
      coffee: {
        files: ['client/**/*.coffee']
        tasks: ['coffee:compile']
        options: { livereload: true }
      }
      css: {
        files: ['client/styles/**/*.less']
        tasks: ['less:compile']
        options: { livereload: true }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-watch')
