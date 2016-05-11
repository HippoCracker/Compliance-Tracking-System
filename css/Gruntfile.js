'user strict'

module.exports = function(grunt) {

	/* Loading all grunt tasks */
	require('load-grunt-tasks')(grunt);

	/* Add dir config */
	var config = {
		dev: 'dev',
		dist: 'dist'
	}//config

	grunt.initConfig({

		config: config,

		watch: {
			options: { livereload: true },
			sass: {
				files: ['<%= config.dev %>/sass/*.scss'],
				tasks: ['compass:dev']
			},//sass
			scripts: {
			  files: [
					'<%= config.dev %>/js/**/*.js'
			  ],//files
			  tasks: ['uglify:dev']
			},//scripts
		},//watch

		sass: {
			dist: {
				files: {
					'<%= config.dev %>/css/style.css': '<%= config.dev %>/sass/style.scss'
				}
			}
		},//sass

		compass: {
			dev: {
				options: {
					config: 'config.rb'
				}//options
			}//dev
		},//compass

		uglify: {
			dev: {
				files: {

				}//files
			},//dev

		},//uglify

		wiredep: {
			dev: {
				src: ['<%= config.dev %>/index.html'],
			}//dev
		},//wiredep

		concat: {
      
		},//concat


	});//initConfig

	grunt.registerTask('default', []);
}//exports