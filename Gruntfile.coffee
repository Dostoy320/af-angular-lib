module.exports = (grunt) ->

  grunt.registerTask 'default', ['coffee','concat','watch']

  grunt.initConfig({
    coffee: {
      glob_to_multiple: {
        expand: true,
        flatten: false,
        cwd: 'dist/scripts/coffee',
        src: '**/*.coffee',
        dest:'dist/scripts/js/',
        ext: '.js'
      }
    }
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
      coffee: {
        files: ['dist/**/*.coffee']
        tasks: ['coffee','concat']
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-watch')