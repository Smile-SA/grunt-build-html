/*
 * grunt-build-html
 * https://github.com/tonai/grunt-build-html
 *
 * Copyright (c) 2013 Tony Cabaye
 * Licensed under the MIT license.
 */
 
'use strict';

module.exports = function(grunt) {
  var path      = require('path');
  var _         = require('lodash');
  var debug     = grunt.log.debug;
  var backtrace = function(files) {
    var message = '[backtrace] : ';
    for (var i in files) {
      message += grunt.util.linefeed + files[i];
    }
    debug(grunt.util.normalizelf(message));
  };

  grunt.registerMultiTask('build_html', 'Build HTML templates recursively.', function() {
    var include, datapath, templates = {};

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      data:                  {},
      templates:             [],
      templateSettings:      {},
      templateNamespaceRoot: undefined
    });

    // Read JSON data.
    if (_.isString(options.data)) {
      datapath = grunt.template.process(options.data);
      if (grunt.file.exists(datapath)) {
        options.data = grunt.file.readJSON(datapath);
      }
    }

    // Include method to be used in HTML files.
    include = function(tplName, data) {
      var files, templateData, html = '';
      data = _.extend({}, options.data, data);

      if (_.has(templates, tplName)) {
        files = _.clone(this.files);
        files.push(templates[tplName].filepath);
        templateData = {files: files};
        data.include = include.bind(templateData);
        try {
          html = _.template(templates[tplName].content, data, options.templateSettings);
        } catch (error) {
          grunt.log.error(error.message);
          backtrace(files);
        }
      } else {
        grunt.log.writeln('Template "' + tplName + '" does not exists.');
        backtrace(this.files);
      }
      
      return html;
    };

    // Process templates.
    _.each(grunt.file.expand(options.templates), function(tpl) {
      var tplKey = "";
      if (options.templateNamespaceRoot) {
        tplKey = path.relative(options.templateNamespaceRoot, path.dirname(tpl));
        if ('tplKey', tplKey !== '') {;
		  tplKey += '/';
		}
      }
      tplKey += path.basename(tpl, path.extname(tpl));
      debug('loading template :', tplKey);
      debug('  path is :', tpl);
      templates[tplKey] = {
        content: grunt.file.read(tpl),
        filepath: tpl
      };
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(file) {
      // Concat specified files.
      var src = file.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        var html = '';
        var templateData = _.extend({}, options.data, {files: [filepath]});
        templateData.include = include.bind(templateData);
        options.filename = filepath;
        try {
          html = _.template(grunt.file.read(filepath), templateData, options.templateSettings);
        } catch (error) {
          grunt.log.error(error.message);
          backtrace(templateData.files);
        }
        return html;
      }).join(grunt.util.normalizelf(grunt.util.linefeed));

      // Write the destination file.
      grunt.file.write(file.dest, src);

      // Print a success message.
      grunt.log.ok('Build HTML file to "' + file.dest + '"');
    });
  });

};
