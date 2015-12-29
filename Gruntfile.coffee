module.exports = (grunt) ->

  grunt.registerTask 'default', ['concat','watch']

  grunt.initConfig({
    concat:{
      js:{
        options:{
          separator:grunt.util.linefeed+';'+grunt.util.linefeed
        }
        files:{
          'dist/scripts/aflib.js':[
            'dist/scripts/js/**/*'
          ]
        }
      }
    }
    watch: {
      scripts: {
        files: ['dist/scripts/js/**/*.js']
        tasks: ['concat']
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-watch')