process.title = 'itbldz';

global.basedir = process.cwd();
global.relativeDir = __dirname;
global.requireRoot = function (name) {
    return require(__dirname + '/' + name);
};

import grunt = require('grunt');
import path = require('path');
require(path.join(global.relativeDir, "src/grunt-utils/gruntfile.js"))(grunt);