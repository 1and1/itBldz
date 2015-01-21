// lazy mocking. to avoid having to mock fs and path (which is tricky), the getDirectory
//  strategy is mocked in the unit tests. Basically a baked in branch by abstraction layer
var getDirectories,
    currentPath = __dirname;

module.exports = (function () {

    this.loadTaskDirectories = function (grunt, srcpath, buildStep) {
        if (!grunt) throw new Error("An instance of grunt is required");
        if (!srcpath) throw new Error("Please add an srcpath to load the tasks from");

        getDirectories = getDirectories || function (srcpath) {
            var fs = require('fs');
            var path = require('path');
            return fs.readdirSync(srcpath).filter(function (file) {
                return fs.statSync(path.join(srcpath, file)).isDirectory();
            });
        };

        var directories = getDirectories(srcpath);
        var result = [];
        directories.forEach(function (task) {
            grunt.loadTasks(((buildStep) ? "./" + buildStep + "/" : "") + task);
            result.push(task);
        });
        return result;
    };

    return this;
})();