module.exports = (grunt) ->

  grunt.registerTask 'default', ['coffee','watch']

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
    watch: {
      coffee: {
        files: ['dist/**/*.coffee']
        tasks: ['coffee:glob_to_multiple']
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-watch')