module.exports = (grunt) ->

  grunt.registerTask 'default', ['coffee']

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
    less: {
      compile: {
        files: {
          "src/static/css/app.css": "src/styles/app.less"
          "src/static/css/ie7.css": "src/styles/ie7.less"
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-less')