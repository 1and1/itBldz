var spying = require('sinon');
module.exports = function () {
    var taskObjectTemplate = function () { return { }; };
    
    this.taskMock = taskObjectTemplate();
    
    this.withRun = function (fun) {
        this.taskMock.run = fun || spying.spy();
        return this;
    };
    
    this.build = function () {
        return this.taskMock;
    };
    
    return this;
};
