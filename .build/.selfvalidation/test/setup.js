global.rewireRoot = function (name) {
    var rewire = require('rewire');
    return rewire(__dirname + '/../../' + name);
}

global.requireRoot = function (name) {
    return require(__dirname + '/../../' + name);
}

global.requireTestRoot = function (name) {
    return require(__dirname + '/../' + name);
}