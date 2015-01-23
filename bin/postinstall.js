var exec = require('../.build/lib/environment/exec.js');
var fs = require('fs');
var dir = require('path').join(__dirname, "..");
fs.chmod(dir + "/build", 0777, function (err) {
    if (err) throw err;
});
fs.chmod(dir + "/bpm", 0777, function (err) {
    if (err) throw err;
});
exec.exec("bpm setup");