var exec = require('child_process').exec,
    path = require('path'),
    fs = require('fs'),
    os = require('os');

var shell = process.env.SHELL || 'sh';

// support for Win32 outside Cygwin
if (os.platform() === 'win32' && process.env.SHELL === undefined) {
    shell = 'cmd.exe';
}

function createEnv() {
    var env = {};
    var item;
    
    for (item in process.env) {
        env[item] = process.env[item];
    }
    
    return env;
}

var argCreate = function(){
    var a = {};
    var isWin = os.platform() === 'win32';

    a.exec = function (value) {
        return isWin ? value : "./" + value;
    };
    a.create = function (arg, value) {
        return (isWin) ? " /" + arg + ' "' + value + '"' : " -" + arg + ' "' + value + '"';
    };
    return a;
};

// scriptFile must be a full path to a shell script
var execute = function (script, workingDirectory, callback) {
    var cmd;
    
    callback = callback || function (err) { if (err) console.error(err); };
    
    workingDirectory = workingDirectory || path.join(__dirname, "../../..");
    
    if (!fs.existsSync(workingDirectory)) {
        callback(new Error('workingDirectory path not found - "' + workingDirectory + '"'), null, null);
    }
    
    if (script === null) {
        callback(new Error('script cannot be null'), null, null);
    }
    
    // transform windows backslashes to forward slashes for use in cygwin on windows
    if (path.sep === '\\') {
        script = script.replace(/\\/g, '/');
    }
    
    var arg = argCreate();
    cmd = '"' + shell + '"' + arg.create("c", arg.exec(script));
    
    console.log("execute " + cmd);
    
    // execute script within given project workspace
    exec(cmd, {
        cwd: workingDirectory,
        env: createEnv()
    }, function (error, stdout, stderr) { callback(error, stdout, stderr); });
};

module.exports = {
    exec: execute
};