global.requireRoot = function (name) {
    return require(__dirname + '/' + name);
};

module.exports = function (grunt) {
    var tasks = [];
    grunt.registerTask('default', tasks);
};
