module.exports = function (grunt, startFolder) {
    var path = require('path');
    var fs = require('fs');
    var merge = require('merge');
    var env = require('./../environment/environment');

    var getFile = function (file) {
        var _ = startFolder.indexOf('node_module') >= 0 ? path.join(startFolder, "./../../../") : path.join(startFolder, "./../");
        return path.join(_, file || "");
    };


    var mergeTarget = function (data) {
        var getTargetFile = grunt.option('target-path') ? function (file) { return path.join(grunt.option('target-path'), file); } : getFile;
        var targetSettings = grunt.option('target-overwrite') || grunt.option('o') || false;

        var targetFile = getTargetFile(data.file + "." + grunt.option('target') + ".json");
        if (fs.existsSync(targetFile)) {
            data.config = targetSettings ? merge(data.config, grunt.file.readJSON(targetFile)) : merge.recursive(false, data.config, grunt.file.readJSON(targetFile));
        }

        return data.config;
    };

    var result = {};

    result.createConfigs = function () {
        require('nopt-grunt')(grunt);

        grunt.initOptions({
            build: {
                short: 'b',
                info: 'The build.json file.',
                type: String
            },
            config: {
                short: 'c',
                info: 'The config.json file.',
                type: String
            },
            target : {
              short: 't',
              info: 'You can use the target to override configurations. i.e. adding a config.release.json file and calling --target=release',
              type: String
            },
            "target-path": {
              short: 'p',
              info: "Specifies the location of the target files",
              type: String
            },
            "target-overwrite-tree": {
              short: 'o',
              info: "When set, overwrites the complete configuration tree that is set in the target. Otherwise, only the values set are overwritten",
              type: Boolean
            }
        });

        var build = grunt.file.readJSON(grunt.option('build') || getFile("build.json"));
        var config = grunt.file.readJSON(grunt.option('config') || getFile("config.json"));

        if (grunt.option('target')) {

            var files = [{ file : "build", config : build }, { file : "config", config : config }];
            files.forEach(mergeTarget);
        }

        config.directories = config.directories || { root: "" };

        config.directories.root = config.directories.root || getFile();

        var _ = {
            build: build,
            config : config,
            env : env.loadEnv()
        };

        return _;
    };

    return result;
};
