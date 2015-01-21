var spying = require('sinon');
module.exports = function () {
    var fsTemplate = function () { return { }; };
    
    this.fsMock = fsTemplate();
    
    this.withReadFile = function (readFile) {
        this.fsMock.readFile = readFile || spying.stub().yields();
        return this;
    };
    
    this.withExists = function (exists) {
        this.fsMock.exists = exists || spying.stub().yields();
        return this;
    };
    
    this.withMkdir = function (mkdir) {
        this.fsMock.mkdir = mkdir || spying.stub().yields();
        return this;
    };
    
    this.withWriteFile = function (writeFile) {
        this.fsMock.writeFile = writeFile || spying.stub().yields();
        return this;
    };

    this.withProperty = function (key, value) {
        this.fsMock[key] = value;
        return this;
    };
    
    this.build = function () {
        return this.fsMock;
    };
        
    return this.withReadFile().withExists().withMkdir().withWriteFile();
};
