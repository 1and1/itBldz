var spying = require('sinon');
module.exports = function () {
    var objectTemplate = function () { return { }; };
    
    this.objectMock = objectTemplate();
    
    this.withProperty = function (key, value) {
        this.objectMock[key] = value;
        return this;
    };
    
    this.build = function () {
        return this.objectMock;
    };
    
    return this;
};
