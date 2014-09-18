/*
 * grunt-build-html
 * https://github.com/tonai/grunt-build-html
 *
 * Copyright (c) 2013 Tony Cabaye
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var request = require('request');
	var debug = grunt.log.debug;

	var isFragmentAvailable = function (fragmentKey, cachePath, skipCache, callback) {
		if (skipCache) {
			callback(false);
		} else {
			fs.exists(cachePath + '/' + fragmentKey, callback);
		}
	};

	var getFragmentFromNetwork = function (fragmentUrl, callback) {
		debug('getFragmentFromNetwork |', fragmentUrl);
		request(fragmentUrl, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				callback(null, body);
			} else {
				calback(error, null);
			}
		});
	};

	var dumpFragmentIntoCache = function (data, fragmentKey, cachePath, callback) {
		fs.writeFile(cachePath + '/' + fragmentKey, data, function (err) {
			if (err) {
				callback(err);
			} else {
				callback(null, data);
			}
		});
	};

	return function (fragmentUrl, fragmentKey, cachePath, skipCache, callback) {
		debug('getFragment', fragmentUrl, fragmentKey, cachePath, skipCache);
		var html = '';
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
				// get directly from file system
				fs.readFile(cachePath + '/' + fragmentKey, callback);
			}
		});
	};
};
