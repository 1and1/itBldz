import logging = require('./logging');
var log = new logging.Log();
var packages = [];

export class Package {
    load(npm, packageToInstall, callback) {
        if (!packages.some((_) => _ == packageToInstall)) {
            log.verbose.writeln("npm", "Package " + packageToInstall + " does not exist. Installing... ");
            npm.commands.install([packageToInstall], () => { 
                packages.push(packageToInstall);
                callback();
            });
        }
        else {
            log.verbose.writeln("npm", "Package " + packageToInstall + " exist. No installation needed.");
            callback();
        }
    }

    public installIfFileNotExist(npm_package, callback) {
        if (!npm_package) throw Error("Npm Package required");
        log.verbose.writeln("npm", "check if package " + npm_package + " exist... ");
        var cb = () => {
            process.chdir(global.basedir);
            callback();
        };

        process.chdir(global.relativeDir);
        require('npm').load((err, npm) => {
            log.verbose.writeln("npm", "npm loaded and continue checking " + npm_package + "...");
            
            if (packages.length > 0) {
                this.load(npm, npm_package, cb);
            }
            else {
                npm.commands.ls([], true, (err, data, lite) => {
                    packages = Object.keys(data.dependencies);
                    this.load(npm, npm_package, cb);
                });
            }
        });
    }
}