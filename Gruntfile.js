/*
 * grunt-build-html
 * https://github.com/smile-sa/grunt-build-html
 *
 * Copyright (c) 2013 Tony Cabaye
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);


  // Project configuration.
  grunt.initConfig({
    myConf: {
      tmp: '.tmp'
    },

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
      tests: ['<%= myConf.tmp %>'],
    },

    // Configuration to be run (and then tested).
    buildHtml: {
      test: {
        options: {
          templates: ['test/fragments/**/*.html'],
          templateNamespaceRoot: 'test/fragments',
          remoteCacheFolder: '<%= myConf.tmp %>/remote-cache'
        },
        expand: true,
        cwd: 'test/fixtures/',
        src: ['**/*.html'],
        dest: '<%= myConf.tmp %>'
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // Whenever the "test" task is run, first clean the ".tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'buildHtml:test', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);
};
