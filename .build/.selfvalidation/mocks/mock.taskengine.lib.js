var spying = require('sinon');
module.exports = function () {
    var taskengineMockTemplate = function () {
        return { };
    };
    
    this.taskengineMock = taskengineMockTemplate();
    
    this.withLoadTaskDirectories = function (loadTaskDirectories) {
        this.taskengineMock.loadTaskDirectories = loadTaskDirectories || spying.spy();
        return this;
    };
    
    this.withSetupTaskAlias = function (setupTaskAlias) {
        this.taskengineMock.setupTaskAlias = setupTaskAlias || spying.spy();
        return this;
    };
    
    this.build = function () {
        return this.taskengineMock;
    };
    
    return this;
};
