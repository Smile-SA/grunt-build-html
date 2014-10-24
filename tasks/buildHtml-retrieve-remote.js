/*
 * grunt-build-html
 * https://github.com/Smile-SA/grunt-build-html
 *
 * Licensed under the MIT license.
 *
 * Based on the initial work of Fabien Rassinier and Romain Gonord
 */

'use strict';

module.exports = function (grunt) {
  var fs = require('fs');
  var request = require('request');
  var path = require('path');
  var mkdirp = require('mkdirp');
  var debug = grunt.log.debug;

  /**
   * Know if content is already in file system
   * @param fragmentKey Remote content key
   * @param cachePath Temp FS cache directory
   * @param skipCache If false, attempt to retrieve remote content from files
   * @param callback Method to call when data is retrieved
   */
  var isFragmentAvailable = function (fragmentKey, cachePath, skipCache, callback) {
    if (skipCache) {
      debug('  cache is disabled so...');
      callback(false);
    } else {
      fs.exists(cachePath + '/' + fragmentKey, callback);
    }
  };

  /**
   * Perform HTTP(S) request to retrieve remote data
   * @param fragmentUrl URL to retrieve
   * @param callback Method to call when data is retrieved
   */
  var getFragmentFromNetwork = function (fragmentUrl, callback) {
    debug('  [GET] ' + fragmentUrl);
    request(fragmentUrl, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        callback(null, body);
      } else {
        callback(error, null);
      }
    });
  };

  /**
   * Dump remote content in file system
   * @param data Remote content data
   * @param fragmentKey Remote content key
   * @param cachePath Temp FS cache directory
   * @param callback Method to call when file is written
   */
  var dumpFragmentIntoCache = function (data, fragmentKey, cachePath, callback) {
    debug('  write content in file system');
    var basePath =  path.dirname(fragmentKey);
    if (basePath){
      mkdirp.sync(cachePath + '/' + basePath);
    }
    fs.writeFile(cachePath + '/' + fragmentKey, data, function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null, data);
      }
    });
  };

  /**
   * Main
   */
  return function (fragmentUrl, fragmentKey, cachePath, skipCache, callback) {
    //debug('getFragment', fragmentUrl, fragmentKey, cachePath, skipCache);
    isFragmentAvailable(fragmentKey, cachePath, skipCache, function (available) {
      if (!available) {
        // skip cache or not present into cache
        getFragmentFromNetwork(fragmentUrl, function (err, data) {
          if (err) {
            callback(err);
          } else {
            dumpFragmentIntoCache(data, fragmentKey, cachePath, callback);
          }
        });
      } else {
        fs.readFile(cachePath + '/' + fragmentKey, callback);
        // get directly from file system
        debug('  read content from file system');
      }
    });
  };
};
