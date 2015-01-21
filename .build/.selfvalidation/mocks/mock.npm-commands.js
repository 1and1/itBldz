var spying = require('sinon');
module.exports = function () {
    var npmCommandsTemplate = function () {
        return {
        };
    };
    
    this.npmCommandsMock = npmCommandsTemplate();
    
    this.withInstall = function (install) {
        this.npmCommandsMock.install = install || spying.spy();
        return this;
    };

    this.withLs = function (ls) {
        this.npmCommandsMock.ls = ls || spying.stub().yields();
        return this;
    };
    
    this.build = function () {
        return this.npmCommandsMock;
    };
    
    return this;
};
