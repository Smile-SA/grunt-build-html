/*
 * grunt-build-html
 * https://github.com/tonai/grunt-build-html
 *
 * Copyright (c) 2013 Tony Cabaye
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    build_html: {
      test: {
        options: {
          templates: ['test/fragments/**/*.html'],
        },
        files: {
	      'tmp/simple-skeleton.html': 'test/fixtures/simple-skeleton.html',
	      'tmp/simple-skeleton-with-submodule.html': 'test/fixtures/simple-skeleton-with-submodule.html',
          'tmp/simple-grid.html': 'test/fixtures/simple-grid.html',
          'tmp/advanced-grid.html': 'test/fixtures/advanced-grid.html',
          'tmp/include-content-hello-world.html': 'test/fixtures/include-content-hello-world.html',
          'tmp/missing-params-custom.html': 'test/fixtures/missing-params-custom.html',
          'tmp/missing-params-default.html': 'test/fixtures/missing-params-default.html',
          'tmp/nothing-to-do.html': 'test/fixtures/nothing-to-do.html'
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'build_html:test', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
