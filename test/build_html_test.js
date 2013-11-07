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

exports.build_html = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  nothingToDo: function(test) {
    var actual = grunt.file.read('tmp/nothing-to-do.html');
    var expected = grunt.file.read('test/expected/simple-hello-world.html');
    test.equal(actual, expected, 'nothing has been altered.');
    test.done();
  },
  simpleSkeleton: function(test) {
    var actual = grunt.file.read('tmp/simple-skeleton.html');
    var expected = grunt.file.read('test/expected/simple-hello-world.html');
    test.equal(actual, expected, 'a simple skeleton is loaded with 2 params set.');
    test.done();
  },
  simpleGridSystem: function(test) {
    var actual = grunt.file.read('tmp/simple-grid.html');
    var expected = grunt.file.read('test/expected/simple-grid.html');
    test.equal(actual, expected, 'a simple grid system.');
    test.done();
  }
};
