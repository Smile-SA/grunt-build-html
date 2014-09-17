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
  var request   = require('request');
  var debug     = grunt.log.debug;
  var backtrace = function(files) {
    var message = '[backtrace] : ';
    for (var i in files) {
      message += grunt.util.linefeed + files[i];
    }
    debug(grunt.util.normalizelf(message));
  };

  grunt.registerMultiTask('buildHtml', 'Build HTML templates recursively.', function() {
    var datapath, templates = {};

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      data:                  {},
      templates:             [],
      templateSettings:      {},
      templateNamespaceRoot: undefined,
      remoteCacheFolder:     undefined,
    });

    // Read JSON data.
    if (_.isString(options.data)) {
      datapath = grunt.template.process(options.data);
      if (grunt.file.exists(datapath)) {
        options.data = grunt.file.readJSON(datapath);
      }
    }

    var getTemplateCacheKeyFromRemoteUrl = function(remoteUrl){
    	if (remoteUrl.indexOf('http') !== 0){
    	  grunt.log.error('something seems wrong with this remote url : ' + remoteUrl);
    	}
    	return remoteUrl.replace(/(\/|\?|\:)/g, '@');
    };

    // Retrieve remote content method to be used in HTML files.
    var retrieve = function (tplUrl, data) {
      if (!options.remoteCacheFolder){
        grunt.log.error('remoteCacheFolder is not set ito plugin option, you have to define it (for example .tmp/remote-cache)');
      }
      debug('retrieve | Retrieve content from "' + tplUrl + '"');
      var remoteFragmentKey = getTemplateCacheKeyFromRemoteUrl(tplUrl);
      if (!templates[remoteFragmentKey]) {
    	debug('retrieve | Remote fragment is not into cache, get it from the disk cache');
    	//   get fragment from disk synchronously (synchronously !)
    	//   if fragment has not been dumped
    	//     retrieve remote fragment (synchronously !)
    	//     dump it into options.remoteCacheFolder
    	//   put fragment into cache
      }
      include(remoteFragmentKey, data);
      return '';
    };

    // Include method to be used in HTML files.
    var include = function(tplName, data) {
      debug('include | Include content from "' + tplName + '" with data=' + JSON.stringify(data));
      var files, templateData, html = '';
      data = _.extend({}, options.data, data);

      if (_.has(templates, tplName)) {
        files = _.clone(this.files);
        files.push(templates[tplName].filepath);
        templateData = {files: files};
        data.include = include.bind(templateData);
        data.retrieve = retrieve.bind(templateData);
        debug('include | templateData=' + JSON.stringify(templateData));
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
      var tplKey = '';
      if (options.templateNamespaceRoot) {
        tplKey = path.relative(options.templateNamespaceRoot, path.dirname(tpl));
        if (tplKey !== '') {
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
        }
        return true;
      }).map(function(filepath) {
        var html = '';
        var templateData = _.extend({}, options.data, {files: [filepath]});
        debug('Evaluate page "' + filepath + '" with templateData=' + JSON.stringify(templateData));
        templateData.include = include.bind(templateData);
        templateData.retrieve = retrieve.bind(templateData);
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
