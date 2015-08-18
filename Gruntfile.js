module.exports = function(grunt) {

  grunt.registerTask('default', ['concat']);
  grunt.registerTask('dev', ['concat', 'watch']);

  grunt.initConfig({

    concat: {
      js: {
        options: {separator: grunt.util.linefeed + ';' + grunt.util.linefeed },
        files: {
          'dist/af-angular-lib.js':[
            'dist/scripts/**/*'
          ],
          'dist/af-angular-setup.js':[
            'dist/setup/console-fix.js',
            'dist/setup/app-env.js',
            'dist/setup/**/*'
          ]
        }
      }
    },

    watch: {
      js: {
        files: ['dist/scripts/**/*.js', 'dist/setup/**/*.js'],
        tasks: ['concat'],
        options: { livereload: true }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
