var npm = require('npm');

module.exports = function (grunt) {
    var self = this, done;
    
    this.isRunning = false;

    this.onDone = function (err) { if (done) { done(err); this.isRunning = false; } };

    this.installIfFileNotExist = function (npm, files, data) {
        if (this.isRunning) return;
        this.isRunning = true;
        
        grunt.verbose.write("starting installing " + files.length + " packages... " + JSON.stringify(files));
        var modules = [];
        files.forEach(function (file) {
            try {
                grunt.verbose.write("check if package " + file + " exist... ");
                if (!file) return;
                
                if (!data.dependencies[file]) {
                    grunt.verbose.ok(file + " is not found and has been added to the list of packages to install");
                    modules.push(file);
                } else {
                    grunt.verbose.writeln(file + " is in dependecies");
                }
            } catch (e) {
                grunt.verbose.ok(file + " is not found and has been added to the list of packages to install");
                modules.push(file);
            }
        });
        
        if (modules.length < 1) {
            grunt.verbose.writeln("No packages to install");
            this.onDone();
            return;
        }
        
        grunt.verbose.writeln("Installing " + modules.length + " packages");
        
        npm.commands.install(modules, this.onDone);
    };

    this.installNpmPackages = function (packages) {
        var self = this;
        if (!packages) {
            grunt.verbose.writeln("no npm packages to install");
            self.onDone(err);
            return;
        }

        packages = packages;
        var length = packages.length;
        grunt.verbose.writeln("resolving " + length + " packages... (" + JSON.stringify(packages) +  ")");
        
        npm.load(function (err, npm) {            
            if (err) {
                grunt.log.error(err);
                self.onDone(err);
                return;
            }

            npm.commands.ls([], true, function (err, data, lite) {
                self.installIfFileNotExist(npm, packages, data);
            });            
        });
    };
    
    grunt.registerTask('npm-install', 'Install npm modules.', function () {
        var options = this.options({ packages : [] });
        done = this.async();
        self.installNpmPackages(options.packages);
    });

    return this;
};
