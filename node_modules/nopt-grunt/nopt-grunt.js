'use strict';

var nopt = require('nopt');

module.exports = function(grunt, options) {
    /**
     * Allows additional options to be registered and listed along with those
     * natively supported by Grunt. Allows for smarter handling than the
     * provided `grunt.option()` api.
     *
     * @method initOptions
     * @param {Object} options
     * @chainable
     */
    grunt.initOptions = function(options) {
        var parsed = null;
        var cli = this.cli;
        var optlist = cli.optlist;
        var aliases = {};
        var known = {};

        // Append options
        Object.keys(options).forEach(function(key) {
            optlist[key] = options[key];
        });

        // Reparse options in exactly the same way as Grunt.
        // https://github.com/gruntjs/grunt/blob/master/lib/grunt/cli.js

        // Parse `optlist` into a form that nopt can handle.
        Object.keys(optlist).forEach(function(key) {
            var short = optlist[key].short;

            if (short) {
                aliases[short] = '--' + key;
            }

            known[key] = optlist[key].type;
        });

        parsed = nopt(known, aliases, process.argv, 2);
        cli.tasks = parsed.argv.remain;
        cli.options = parsed;
        delete parsed.argv;

        // Initialize any Array options that weren't initialized.
        Object.keys(optlist).forEach(function(key) {
            if (optlist[key].type === Array && !(key in cli.options)) {
                cli.options[key] = [];
            }
        });

        // Update internal value
        this.option.init(cli.options);

        return this;
    };

    // Handle `require('nopt-grunt')(grunt, { ... });`
    if (arguments.length === 2) {
        grunt.initOptions(options);
    }
};
