import logging = require('./logging');
var log = new logging.Log();
var packages = [];

export class Package {
    load(npm, packagesToInstall: string[], callback) {
        var toInstall = packagesToInstall.filter((_) => !packages.some((i) => i == _));

        toInstall.forEach((_) => log.verbose.writeln("npm", "Package " + _ + " does not exist. Installing... "));

        npm.commands.install(toInstall, () => {
            toInstall.forEach((_) => packages.push(_));
            callback();
        });
    }

    public installIfFileNotExist(npm_package: string, dependencies: string[], callback) {
        dependencies = dependencies || [];
        if (!npm_package) throw Error("Npm Package required");
        log.verbose.writeln("npm", "check if package " + npm_package + " and " + dependencies.length + " dependencies exist... ");
        var cb = () => {
            process.chdir(global["basedir"]);
            callback();
        };

        dependencies.push(npm_package);

        process.chdir(global["relativeDir"]);
        require('npm').load((err, npm) => {
            
            if (packages.length > 0) {
                this.load(npm, dependencies, cb);
            }
            else {
                npm.commands.ls([], true, (err, data, lite) => {
                    packages = Object.keys(data.dependencies);
                    this.load(npm, dependencies, cb);
                });
            }
        });
    }
}