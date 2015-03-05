# nopt-grunt [![Build Status](https://travis-ci.org/shannonmoeller/nopt-grunt.png)](https://travis-ci.org/shannonmoeller/nopt-grunt)

> Allows additional command line options to be properly registered using [nopt](https://github.com/isaacs/nopt) along with those natively supported by [grunt](http://gruntjs.org).

## Install

```sh
$ npm install nopt-grunt
```

## Example

Grunt is awesome. Grunt's support for using additional command line options is not awesome. The current [documentation](http://gruntjs.com/api/grunt.option) is misleading in that they give examples of using boolean flags and options with values, but they don't tell you that it only works that way with a single option. Try and use more than one option and things fall apart quickly.

```js
// Gruntfile.js -> grunt --foo
module.exports = function(grunt) {
    assert.strictEqual(grunt.option('foo'), true); // pass
    grunt.registerTask('default', []);
};

// Gruntfile.js -> grunt --bar=42
module.exports = function(grunt) {
    assert.strictEqual(grunt.option('bar'), 42);   // pass
    grunt.registerTask('default', []);
};

// Gruntfile.js -> grunt --foo --bar=42
module.exports = function(grunt) {
    assert.strictEqual(grunt.option('foo'), true); // fail -> foo === '--bar=42'
    assert.strictEqual(grunt.option('bar'), 42);   // fail -> bar === undefined
    grunt.registerTask('default', []);
};
```

Not helpful. Back to the [documentation](http://gruntjs.com/creating-tasks#cli-options-environment)! Still [not helpful](http://gruntjs.com/frequently-asked-questions#options).  Enter `nopt-grunt`.

```js
// Gruntfile.js -> grunt --foo --bar=42
module.exports = function(grunt) {
    // require it at the top and pass in the grunt instance
    require('nopt-grunt')(grunt);

    // new method now available
    grunt.initOptions({
        // longhand
        foo: {
            info: 'Some flag of interest.',
            type: Boolean
        },

        // shorthand
        bar: [Number, null]
    });

    assert.strictEqual(grunt.option('foo'), true); // pass!
    assert.strictEqual(grunt.option('bar'), 42);   // pass!

    // reference values as before
    grunt.option('no-foo');

    grunt.initConfig({});
    grunt.registerTask('default', []);
};
```

## License

MIT

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/ae3a06cc73fded765f8492d78c66ad30 "githalytics.com")](http://githalytics.com/shannonmoeller/handlebars-layouts)
