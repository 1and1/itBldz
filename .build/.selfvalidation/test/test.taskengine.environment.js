var should = require('should'),
    builder = require('./../mocks/builder'),
    spying = require('sinon');
var taskengine = rewireRoot('lib/taskengine/environment.js');

describe("Given I load the task directory using the taskengine", function () {
    var gruntMock,
        getDirectories = spying.stub().returns(["task"]);
    
    taskengine.__set__("getDirectories", getDirectories);
    
    describe("Given I don't pass a grunt instance", function () {
        var error;
        beforeEach(function () {
            try {
                taskengine.loadTaskDirectories();
            } catch (err) {
                error = err;
            }
        });
        
        it("should have thrown an exception", function () {
            should.exist(error);
        });
        
        it("should not have tryed to load anything", function () {
            getDirectories.called.should.be.false;
        });
    });
    
    describe("Given I don't pass a src directory", function () {
        var error;
        beforeEach(function () {
            try {
                taskengine.loadTaskDirectories(builder["grunt"]().build());
            } catch (err) {
                error = err;
            }
        });
        
        it("should have thrown an exception", function () {
            should.exist(error);
        });
        
        it("should not have tryed to load anything", function () {
            getDirectories.called.should.be.false;
        });
    });
    
    describe("Given I want to load a directory", function () {
        var error, result;
        before(function () {
            try {
                result = taskengine.loadTaskDirectories(builder["grunt"]().withLoadTasks().build(), ".");
            } catch (err) {
                error = err;
            }
        });
        
        it("should not have thrown an exception", function () {
            should.not.exist(error);
        });
        
        it("should have returned a valid result", function () {
            should.exist(result);
            result.length.should.be.exactly(1);
            result[0].should.be.exactly("task");
        });
        
        it("should have loaded the direcories", function () {
            getDirectories.called.should.be.true;
        });
    });
});