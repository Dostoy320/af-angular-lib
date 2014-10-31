module.exports = function(grunt) {

  grunt.registerTask('default', ['concat']);
  grunt.registerTask('dev', ['concat', 'watch']);

  grunt.initConfig({

    concat: {
      js: {
        options: {separator: grunt.util.linefeed + ';' + grunt.util.linefeed },
        files: {
          'dist/scripts/af-angular-lib.js':[
            'dist/scripts/**/*',
            '!dist/scripts/af-angular-lib.js'
          ]
        }
      }
    },

    watch: {
      js: {
        files: ['dist/scripts/**/*.js', 'afAngularLib.js'],
        tasks: ['concat'],
        options: { livereload: true }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
