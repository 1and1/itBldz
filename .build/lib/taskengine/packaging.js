var npmTask;

module.exports = {
    loadPackage : function (grunt, _packages) {
        // NOTE: rewire and graceful-fs both use __get__, so we need really lazy
        //  loading to test this. Otherwise an "Cannot redefine property: __get__"
        //  pops up when running the unit tests
        npmTask = npmTask || requireRoot('lib/packaging/npm-task');

        if (!_packages) return;
        if (_packages.constructor !== Array) {
            _packages = [_packages];
        }
        
        //npmTask(grunt).installNpmPackages(_packages);
        _packages.forEach(function (_package) {
            grunt.loadNpmTasks(_package);
        });
    }
};