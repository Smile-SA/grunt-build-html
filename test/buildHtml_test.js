'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/
var tmpFolder = '.tmp';

exports.buildHtml = {
  nothingToDo: function(test) {
    var actual = grunt.file.read(tmpFolder + '/nothing-to-do.html');
    var expected = grunt.file.read('test/expected/simple-hello-world.html');
    test.equal(actual, expected, 'nothing has been altered.');
    test.done();
  },
  simpleSkeleton: function(test) {
    var actual = grunt.file.read(tmpFolder + '/simple-skeleton.html');
    var expected = grunt.file.read('test/expected/simple-hello-world.html');
    test.equal(actual, expected, 'a simple skeleton is loaded with 2 params set.');
    test.done();
  },
  simpleSkeletonWithSubmodule: function(test) {
    var actual = grunt.file.read(tmpFolder + '/simple-skeleton-with-submodule.html');
    var expected = grunt.file.read('test/expected/simple-hello-world.html');
    test.equal(actual, expected, 'a simple skeleton is loaded with 2 params set, one of them is a submodule.');
    test.done();
  },
  includeContentHelloWorld: function(test) {
    var actual = grunt.file.read(tmpFolder + '/include-content-hello-world.html');
    var expected = grunt.file.read('test/expected/simple-hello-world.html');
    test.equal(actual, expected, 'a simple skeleton is loaded with 2 params set, one of them is a submodule, this submodule simply loads a module.');
    test.done();
  },
  includeContentHelloWorldFromSubfolder: function(test) {
    var actual = grunt.file.read(tmpFolder + '/include-content-hello-world-from-subfolder.html');
    var expected = grunt.file.read('test/expected/include-content-hello-world-from-subfolder.html');
    test.equal(actual, expected, 'test the correct behavior with namespaced templates');
    test.done();
  },
  includeContentHelloWorldFromVeryDeepSubfolder: function(test) {
    var actual = grunt.file.read(tmpFolder + '/include-content-hello-world-from-very-long-url.html');
    var expected = grunt.file.read('test/expected/include-content-hello-world-from-very-long-url.html');
    test.equal(actual, expected, 'test the correct behavior with very long remote url');
    test.done();
  },
  missingParamDefault: function(test) {
    var actual = grunt.file.read(tmpFolder + '/missing-params-default.html');
    var expected = grunt.file.read('test/expected/missing-params-default.html');
    test.equal(actual, expected, 'load a module without overriding a default parameter.');
    test.done();
  },
  missingParamCustom: function(test) {
    var actual = grunt.file.read(tmpFolder + '/missing-params-custom.html');
    var expected = grunt.file.read('test/expected/missing-params-custom.html');
    test.equal(actual, expected, 'load a module overriding a default parameter.');
    test.done();
  },
  templatesWithWhitespaceInTheirName: function(test) {
    var actual = grunt.file.read(tmpFolder + '/include-content-hello-world-with-whitespace.html');
    var expected = grunt.file.read('test/expected/simple-hello-world.html');
    test.equal(actual, expected, 'folder tree structure is not altered.');
    test.done();
  },
  processSubfolder: function(test) {
    var actual = grunt.file.read(tmpFolder + '/subfolder/nothing-to-do.html');
    var expected = grunt.file.read('test/expected/subfolder/nothing-to-do.html');
    test.equal(actual, expected, 'folder tree structure is not altered.');
    test.done();
  },
  simpleGridSystem: function(test) {
    var actual = grunt.file.read(tmpFolder + '/simple-grid.html');
    var expected = grunt.file.read('test/expected/simple-grid.html');
    test.equal(actual, expected, 'a simple grid system.');
    test.done();
  },
  simpleSkeletonWithRemoteSubmodule: function(test) {
    var actual = grunt.file.read(tmpFolder + '/simple-skeleton-with-remote-submodule.html');
    var expected = grunt.file.read('test/expected/simple-hello-world.html');
    test.equal(actual, expected, 'a simple skeleton is loaded with 2 params set, one of them is a remote submodule.');
    test.done();
  },
  stopNestedEvaluation: function(test) {
    var actual = grunt.file.read(tmpFolder + '/simple-hello-world-without-nested-evalation.html');
    var expected = grunt.file.read('test/expected/simple-hello-world-without-nested-evalation.html');
    test.equal(actual, expected, 'submodule should not be evaluated !');
    test.done();
  }
};
