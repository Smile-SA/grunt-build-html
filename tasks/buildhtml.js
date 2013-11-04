'use strict';

module.exports = function(grunt) {
  var path = require('path');
  var _    = grunt.util._;
  var backtrace = function(files) {
    var message = '[backtrace] : ';
    for (var i in files) {
      message += '\n' + files[i];
    }
    grunt.log.debug(message);
  };

  grunt.registerMultiTask('buildhtml', 'Build templates into plain HTML', function() {
    var include = null;
    var templates    = {};
    var options      = this.options({
      templates: []
    });

    // Include method to be used in HTML files.
    include = function(tplName, data) {
      var files, templateData, html = '';
      if (typeof data == 'undefined') {
        data = {};
      }

      if (_.has(templates, tplName)) {
        files = _.clone(this.files);
        files.push(templates[tplName].filepath);
        templateData = {files: files};
        data.include = include.bind(templateData);
        try {
          html = _.template(templates[tplName].content, data);
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
      var tplName = path.basename(tpl, path.extname(tpl)).replace(/[\s]/g, '_');
      templates[tplName] = {
        content: grunt.file.read(tpl),
        filepath: tpl
      };
    });

    // Iterate over all src-dest file pairs.
    this.files.forEach(function(file) {
      var content = file.src
        .filter(function(filepath) {
          // Warn on and remove invalid source files (if nonull was set).
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
          } else {
            return true;
          }
        }).map(function(filepath) {
          var html = '';
          var templateData = {files: [filepath]};
          templateData.include = include.bind(templateData);
          options.filename = filepath;
          try {
            html = _.template(grunt.file.read(filepath), templateData);
          } catch (error) {
            grunt.log.error(error.message);
            backtrace(templateData.files);
          }
          return html;
        })
        .join(grunt.util.normalizelf(grunt.util.linefeed));

      // Write the destination file.
      grunt.file.write(file.dest, content);

      // Print a success message.
      grunt.log.ok('Build HTML file to "' + file.dest + '"');
    });
  });
};
