var spying = require('sinon');
module.exports = function () {
    var npmMockTemplate = function () {
        return {
            load : spying.spy()
        };
    };
    
    this.npmMock = npmMockTemplate();
    
    this.withLoad = function(load) {
        this.npmMock.load = load || templates.load;
        return this;
    };

    this.withLoadError = function (load) {
        this.npmMock.load = load || templates.loadError;
        return this;
    };

    this.withCommands = function (commands) {
        this.npmMock.commands = commands || spying.spy();
        return this;
    };

    this.build = function () {
        return this.npmMock;
    };    
    
    var me = this;
    var templates = {
        load : function (delegate) {
            delegate(null, me.npmMock);
        },
        
        loadError : function (delegate) {
            delegate("Bad error!", me.npmMock);
        }
    };

    return this;
};
