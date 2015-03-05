exports.loadEnv = function () {
    var self = {};
    
    // copy the environment to a specialized object
    Object.keys(process.env).forEach(function (key) {
        self[key] = process.env[key];
    });

    return self;
};