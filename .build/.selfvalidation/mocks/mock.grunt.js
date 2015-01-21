var spying = require('sinon');
module.exports = function () {
    var gruntMockTemplate = function () {
        return {
            "verbose": {
                "writeln" : spying.spy(),
                "write" : spying.spy(),
                "ok" : spying.spy(),
                "error" : spying.spy()
            },
            "log" : {
                "writeln" : spying.spy(),
                "write" : spying.spy(),
                "ok" : spying.spy(),
                "error" : spying.spy()
            },
            "fail" : {
                "warn" : spying.spy()
            },
            "registerMultiTask" : spying.spy(),
            "registerTask" : spying.spy()
        };
    };
    
    this.gruntMock = gruntMockTemplate();
    
    this.withLoadNpmTasks = function (delegate) {
        this.gruntMock["loadNpmTasks"] = delegate || spying.spy();
        return this;
    };
    
    this.withLoadTasks = function (delegate) {
        this.gruntMock["loadTasks"] = delegate || spying.spy();
        return this;
    };

    this.withRegisterTask = function (delegate) {
        this.gruntMock["registerTask"] = delegate || spying.stub().yields();
        return this;
    };
    
    this.withUtil = function (util) {
        this.gruntMock["util"] = util || spying.spy();
        return this;
    };
    
    this.withConfig = function (config) {
        this.gruntMock["config"] = config || spying.spy();
        return this;
    }

    this.withTask = function (task) {
        this.gruntMock["task"] = task || spying.spy();
        return this;
    }
    
    this.withInitConfig = function (delegate) {
        this.gruntMock["initConfig"] = delegate || spying.spy();
        return this;
    }
    
    this.build = function () {
        return this.gruntMock;
    };
    
    return this;
}
