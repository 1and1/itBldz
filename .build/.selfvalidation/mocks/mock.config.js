var spying = require('sinon');
module.exports = function () {
    var configMockTemplate = function () {
        return {
            set : spying.spy()
        };
    };
    
    this.isFun = false;
    this.configMock = configMockTemplate();
    
    this.withProperty = function (propertyKey, value) {
        this.configMock[propertyKey] = value || null;
        return this;
    };

    this.withLog = function (log) {
        this.configMock["log"] = log || function() { this.config = function () { }, this.error = function (context, err) { console.error(context + ": " + err); }; return this; };
        return this;
    };
    
    this.asFunction = function (fun) {
        this.isFun = true;
        return this;
    };
    
    this.build = function () {
        var self = this;
        return ((this.isFun) ? function () { return self.configMock; } : this.configMock);
    };
    
    return this;
};
