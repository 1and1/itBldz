'use strict';

var assert = require('assert');

// Test with `grunt test --foo --bar 42`
module.exports = function(grunt) {
    assert.strictEqual(grunt.option('foo'), '--bar=42');
    assert.strictEqual(grunt.option('bar'), undefined);

    require('./nopt-grunt')(grunt, {
        foo: {
            info: 'can foo',
            type: Boolean
        },
        bar: {
            info: 'bar count',
            type: Number
        }
    });

    assert.strictEqual(grunt.option('foo'), true);

    grunt.registerTask('test', function() {
        assert.strictEqual(grunt.option('bar'), 42);
    });
};
