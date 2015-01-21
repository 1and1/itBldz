module.exports.parse = function (args) {
    var ArgumentParser = require('argparse').ArgumentParser;
    
    var withVerbose = function (currentParser) {
        currentParser.addArgument(['--verbose'], { required: false, defaultValue: false, action : 'storeTrue', help: 'Prints verbose output' });
        return currentParser;
    };
    
    var withModuleTasks = function (currentParser) {
        currentParser.addArgument(['-m', '--module'], { required: true, help: 'The path of the module to add. I.e. "validate/syntax/js"' });
        currentParser.addArgument(['-t', '--task'], { required: true, help: 'The task that should be triggered. I.e. "jsvalidate"' });
        currentParser.addArgument(['-p', '--package'], { help: 'The npm package for this task. I.e. "grunt-jsvalidate"' });
        currentParser.addArgument(['-d', '--description'], { help: 'The description for this module.' });
        withVerbose(currentParser);
        return currentParser;
    };
    
    var withSetup = function (currentParser) {
        currentParser.addArgument(['-c', '--config'], { required: false, defaultValue : "build.json", help: 'The path to the config file that is used for the setup. I.e. "build.json"' });
        withVerbose(currentParser);
        return currentParser;
    };
    
    var parser = withVerbose(new ArgumentParser({
        version: '0.0.1',
        addHelp: true,
        description: 'Build package management tools',
    }));
    
    var subparsers = parser.addSubparsers({ dest : "action", title : "actions", description : "choose the action you want to execute" });
    withSetup(subparsers.addParser('setup', { dest : "setup", help: 'sets a project up based on a config', addHelp: true }));
    withModuleTasks(subparsers.addParser('remove', { dest : "remove", help: 'removes a module from the build', addHelp: true }));
    withModuleTasks(subparsers.addParser('add', { dest : "add", help: 'adds a module to the build', addHelp: true }));
    
    return parser.parseArgs(args);
}

module.exports.module = function (args) {
    var result = {
        "module" : args.module,
        "task" : args.task.split(','),
        "package" : args.package,
        "description" : args.description
    };

    result.moduleTree = result.module.split('/');
    result.parent = result.moduleTree.length > 1 ? result.moduleTree[result.moduleTree.length - 2] : null;
    result.name = result.moduleTree[result.moduleTree.length - 1];

    return result;
};

module.exports.setup = function (args) {
    var result = {
        "config" : args.config
    };
    
    return result;
};