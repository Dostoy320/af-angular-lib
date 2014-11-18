module.exports = function(grunt) {

  grunt.registerTask('default', ['copy', 'less', 'concat', 'watch']);

  grunt.initConfig({

    less: {
      compile: {
        files: {
          'app/static/css/app-init.css':  'app/styles/app-init.less',
          'app/static/css/ie8.css':       'app/styles/ie8.less',
          'app/static/css/app-blue.css':  'app/styles/themes/app-blue.less',
          'app/static/css/app-green.css': 'app/styles/themes/app-green.less'
        }
      }
    },

    concat: {

      // APP
      app:{
        options: { separator: grunt.util.linefeed + ';' + grunt.util.linefeed },
        nonull: true,
        files:{
          'app/static/js/app.js':    ['app/app.init.js', 'app/app.ctrl.js', 'app/*.js'],
          'app/static/js/scripts.js': 'app/scripts/**/*.js',
          'app/static/js/ctrls.js':   'app/views/**/*.js'
        }
      },

      // LIBRARIES
      bower: {
        options: {separator: grunt.util.linefeed + ';' + grunt.util.linefeed},
        nonull: true,
        files: {
          'app/static/js/af-angular-lib.js':[
            '../af-angular-lib/dist/scripts/**/*.js'
          ],
          'app/static/js/setup.js':[
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/amplify/lib/amplify.core.min.js',
            'bower_components/amplify/lib/amplify.store.min.js',
            'bower_components/raven-js/dist/raven.min.js',
            '../af-angular-lib/dist/setup/console-fix.js',
            '../af-angular-lib/dist/setup/app-env.js',
            '../af-angular-lib/dist/setup/**/*.js'
          ],
          'app/static/js/libs.dev.js':[
            'bower_components/angular/angular.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            // ui
            //'bower_components/bootstrap/dist/js/bootstrap.js',
            // util
            'bower_components/lodash/dist/lodash.js',
            'bower_components/moment/moment.js',
            'bower_components/async/lib/async.js',
            // forms
            'bower_components/jquery-validation/dist/jquery.validate.js'
          ],
          'app/static/js/libs.min.js':[
            // angular
            'bower_components/angular/angular.min.js',
            'bower_components/angular-sanitize/angular-sanitize.min.js',
            'bower_components/angular-animate/angular-animate.min.js',
            'bower_components/angular-ui-router/release/angular-ui-router.min.js',
            // ui
            //'bower_components/bootstrap/dist/js/bootstrap.min.js',
            // util
            'bower_components/lodash/dist/lodash.min.js',
            'bower_components/moment/min/moment.min.js',
            'bower_components/async/lib/async.js',
            // forms
            'bower_components/jquery-validation/dist/jquery.validate.min.js'
          ],
          // ie8
          'app/static/js/ie8.js':[
            'bower_components/respond/dest/respond.min.js'
          ]
        }
      }
    },

    //
    // MOVE SOME NEEDED FILES OUT OF BOWER INTO OUR PROJECT
    //
    copy: {
      bower: {
        files: [
          // font icons
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: [
              'bower_components/bootstrap/dist/fonts/**/*',
              'bower_components/font-awesome/fonts/**/*'
            ],
            dest: 'app/static/fonts/'
          },
          // af-lib images
          {
            expand: true,
            flatten: false,
            cwd: 'bower_components/af-angular-lib/dist/assets/img/',
            src: '**/*',
            dest: 'app/static/img/'
          }
          // af-lib templates
          //{
          //  expand: true,
          //  flatten: false,
          //  cwd: 'bower_components/af-angular-lib/dist/templates/',
          //  src: '**/*',
          //  dest: 'app/static/templates/'
          //}
        ]
      }
    },



    watch: {
      misc: {
        files: ['*.html', 'app/**/*.html', '!app/static/**/*'],
        options: { livereload: true }
      },
      js: {
        files: ['app/**/*.js', '!app/static/js/**/*', '../af-angular-lib/dist/**/*.js'],
        tasks: ['concat'],
        options: { livereload: true }
      },
      css: {
        files: ['app/styles/**/*.less'],
        tasks: ['less:compile'],
        options: { livereload: true }
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
