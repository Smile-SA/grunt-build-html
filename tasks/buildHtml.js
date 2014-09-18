/*
 * grunt-build-html
 * https://github.com/tonai/grunt-build-html
 *
 * Copyright (c) 2013 Tony Cabaye
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
  var path = require('path');
  var _ = require('lodash');
  var sync = require('synchronize');
  var mkdirp = require('mkdirp');
  var retrieveRemote = require('./buildHtml-retrieve-remote')(grunt);
  var debug = grunt.log.debug;

  var backtrace = function (files) {
    var message = '[backtrace] : ';
    var i;
    for (i in files) {
      message += grunt.util.linefeed + files[i];
    }
    debug(grunt.util.normalizelf(message));
  };

  grunt.registerMultiTask('buildHtml', 'Build HTML templates recursively.', function () {
    var datapath, urlPrefix, urlSuffix;
    var templates = {}
    var cache = {};

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      data : {},
      templates : [],
      templateSettings : {},
      templateNamespaceRoot : undefined,
      remoteCacheFolder : '.tmp/remote-cache',
      remoteUrl : {},
    });

    // Read JSON data and add it with options
    if (_.isString(options.data)) {
      datapath = grunt.template.process(options.data);
      if (grunt.file.exists(datapath)) {
        options.data = grunt.file.readJSON(datapath);
      }
    }

    // Deal with URL prefix and suffix
    if (options.remoteUrl) {
      if (_.isString(options.remoteUrl.prefix)) {
        urlPrefix = grunt.template.process(options.remoteUrl.prefix);
      }
      if (_.isString(options.remoteUrl.suffix)) {
        urlSuffix = grunt.template.process(options.remoteUrl.suffix);
      }
    }

    var getTemplateCacheKeyFromRemoteUrl = function (remoteUrl) {
      if (remoteUrl.indexOf('http') !== 0) {
        grunt.log.error('something seems wrong with this remote url : ' + remoteUrl);
      }
      return remoteUrl.replace(/(\/|\?|\:)/g, '@');
    };

    var getTemplateFromCache = _.memoize(function (key) {
      return cache[key];
    }, _.identity);

    /**
     * Retrieve remote content method to be used in HTML files.
     * 
     * @param tplUrl
     *            Remote content URL
     * @param data
     *            Options
     * @returns {*} Remote content data
     */
    var retrieve = function (tplUrl, data) {
      if (urlPrefix) {
        tplUrl = urlPrefix + tplUrl;
      }
      if (urlSuffix) {
        tplUrl += urlSuffix;
      }
      var html = '';
      debug('Retrieve remote content from "' + tplUrl + '"');
      var remoteFragmentKey = getTemplateCacheKeyFromRemoteUrl(tplUrl);
      if (data && !data.cache) {
        html = retrieveFromUrl(tplUrl, remoteFragmentKey, true);
      } else {
        if (!_.has(cache, remoteFragmentKey)) {
          cache[remoteFragmentKey] = retrieveFromUrl(tplUrl, remoteFragmentKey, false);
          debug('Save ' + remoteFragmentKey + ' result in cache');
        }
        html = getTemplateFromCache(remoteFragmentKey);
      }
      return html;
    };

    // Include method to be used in HTML files.
    var include = function (tplName, data) {
      debug('Include content from "' + tplName + '"');
      var files, templateData, html = '';
      data = _.extend({}, options.data, data);

      if (_.has(templates, tplName)) {
        files = _.clone(this.files);
        files.push(templates[tplName].filepath);
        templateData = {
          files : files
        };
        data.include = include.bind(templateData);
        data.retrieve = retrieve.bind(templateData);
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

    var retrieveFromUrl = function (tplUrl, fragmentKey, skipCache) {
      // get fragment synchronously ='(
      return sync.await(retrieveRemote(tplUrl, fragmentKey, options.remoteCacheFolder, skipCache, sync.defer()));
    };

    // Process templates.
    _.each(grunt.file.expand(options.templates), function (tpl) {
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
        content : grunt.file.read(tpl),
        filepath : tpl
      };
    });

    var processData = function () {
      // Iterate over all specified file groups.
      files.forEach(function (file) {
        // Concat specified files.
        var src = file.src.filter(function (filepath) {
          // Warn on and remove invalid source files (if nonull was
          // set).
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
          }
          return true;
        }).map(function (filepath) {
          var html = '';
          var templateData = _.extend({}, options.data, {
            files : [ filepath ]
          });
          debug('Evaluate page "' + filepath + '" with templateData=' + JSON.stringify(templateData));
          templateData.include = include.bind(templateData);
          options.templateSettings.imports = {
            'retrieve' : retrieve
          };
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
    };

    mkdirp.sync(options.remoteCacheFolder);
    var files = this.files;
    var task = this;
    sync.fiber(function () {
      var done = task.async();
      processData(files);
      done();
    });
  });
};
