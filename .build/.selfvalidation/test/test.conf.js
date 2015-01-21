var should = require('should'),
    spying = require('sinon'),
    builder = require('./../mocks/builder'),
    rewire = require('rewire');

var confLoader = rewireRoot('conf');
var properties = { find: spying.spy() };

confLoader.__with__({
    'glob' : { sync: function (path, params) { return []; } },
    'properties' : properties
})(function () {
    
    var gruntMock;
    
    describe('Given I want to log using the conf', function () {
        var log;
        beforeEach(function () {
            gruntMock = builder["grunt"]().withConfig().build();
            log = confLoader.log(gruntMock);
        });

        describe("Given I want to log the current config", function () {
            beforeEach(function () {
                log.config();
            });

            it("should have logged the current config", function () {
                should.exist(gruntMock.verbose.writeln.called);
                should.exist(gruntMock.config.callCount);
                gruntMock.config.callCount.should.be.exactly(1);
            });
        });

        describe("Given I want to log an error", function () {
            beforeEach(function () {
                log.error("task", "myerror");
            });
            
            it("should have logged that an error has occured", function () {
                should.exist(gruntMock.log.error.called);
                gruntMock.log.error.calledOnce.should.be.true;
            });

            it("should have logged the current error", function () {
                should.exist(gruntMock.verbose.error.called);
                gruntMock.verbose.error.calledWith("myerror").should.be.true;
            });

            it("should have failed the grunt task", function () {
                should.exist(gruntMock.fail.warn.called);
                gruntMock.fail.warn.calledWith("task operation failed.").should.be.true;
            });
        });
    });
    
    describe('Given I want to load the full configuration', function () {
        var config = { "foo" : 'bar' };
        
        beforeEach(function () {
            var configMock = builder["config"]().build();
            gruntMock = builder["grunt"]().withConfig(configMock).build();
            confLoader.loadConfig(config, gruntMock);
        });
        
        it('should have set the "config" field for the config', function () {
            gruntMock.config.set.callCount.should.be.exactly(1);
            gruntMock.config.set.calledWith('config', config).should.be.true;
        });
    });
    
    describe('Given I want to load the full build', function () {
        var config = { "foo" : 'bar' };
        
        beforeEach(function () {
            var configMock = builder["config"]().build();
            gruntMock = builder["grunt"]().withConfig(configMock).build();
            confLoader.loadBuild(config, gruntMock);
        });
        
        it('should have set the "build" field for the config', function () {
            gruntMock.config.set.callCount.should.be.exactly(1);
            gruntMock.config.set.calledWith('build', config).should.be.true;
        });
    });
    
    describe('Given I want to load all tasks', function () {
        var tasks = ["1", "2", "3"];
        
        beforeEach(function () {
            gruntMock = builder["grunt"]().withLoadTasks().build();
            confLoader.loadTasks(tasks, gruntMock);
        });
        it('should have loaded all tasks', function () {
            gruntMock.loadTasks.callCount.should.be.exactly(tasks.length);
        });
    });

    describe('Given I want to prepare the build', function () {
        var result;
        
        beforeEach(function () {
            result = confLoader.prepareBuild({ "empty" : "build" });
        });
        
        it("should have returned a valid build result", function () {
            should.exist(result);
            should.exist(result.prebuild);
            should.exist(result.prebuild["npm-install"]);
        });        
    });
    
    describe('Given I want to run the build', function () {
        
        var taskMock;

        beforeEach(function () {
            taskMock = builder["task"]().withRun().build();
            gruntMock = builder["grunt"]().withTask(taskMock).build();
            confLoader.run("parent", "task", gruntMock);
        });
        
        it("should have logged the status", function () {
            gruntMock.verbose.write.called.should.be.true;
            gruntMock.verbose.ok.called.should.be.true;
        });

        it("should have scheduled the task to run", function () {
            taskMock.run.called.should.be.true;
            taskMock.run.calledWith("task").should.be.true;
        });
    });
});