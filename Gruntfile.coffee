module.exports = (grunt) ->

  grunt.registerTask 'default', ['coffee','watch']

  grunt.initConfig({
    coffee: {
      glob_to_multiple: {
        expand: true,
        flatten: false,
        cwd: 'dist/coffee',
        src: '**/*.coffee',
        dest:'dist/js/',
        ext: '.js'
      }
    }
    watch: {
      coffee: {
        files: ['dist/coffee/**/*.coffee']
        tasks: ['coffee:glob_to_multiple']
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-watch')