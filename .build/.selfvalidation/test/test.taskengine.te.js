var should = require('should'),
    monkeyPatch = require('./../monkey/patch'),
    builder = require('./../mocks/builder');
var te, gruntMock;

var options;

describe("Given I want to create a task context", function () {
    
    beforeEach(function () {
        options = {
            "parent" : "parent",
            "options" : {
                "task" : "jsvalidate",
                "package" : "grunt-jsvalidate"
            }
        };

        te = new require('./../fake/fake.taskengine.te.js').te(options);
        
        gruntMock = builder["grunt"]().withRegisterTask().build();        
    });

    describe("Given I pass invalid arguments", function () {

        describe("Given I don't pass a grunt instance", function () {
            var error;
            before(function () {
                try {
                    te.createTaskConfig(null);
                } catch (e) {
                    error = e;
                }
            });
            
            it("should have thrown an exception", function () {
                should.exist(error);
            });
        });

        describe("Given I don't pass a configuration", function () {
            var error;
            before(function () {
                try {
                    te.createTaskConfig(gruntMock);
                } catch (e) {
                    error = e;
                }
            });
            
            it("should have thrown an exception", function () {
                should.exist(error);
            });
        });
    });

    describe("Given I create a task configuration", function () {
        var error;

        beforeEach(function () {
            try {
                te.createTaskConfig(gruntMock, {});
            } catch (e) {
                error = e;
            }
        });
        
        it("should not have thrown an exception", function () {
            should.not.exist(error);
        });

        it("should have created a configuration", function () {
            te.__underlyingEngine.conf.createConfig.called.should.be.true;
        });

        it("should have loaded the package", function () {
            te.__underlyingEngine.pck.loadPackage.called.should.be.true;
        });
    });
});

describe("Given I want to run a subtask", function () {
    describe("without a valid context", function () {
        beforeEach(function () {
            gruntMock = builder["grunt"]().withRegisterTask().build();
        });

        describe("Given I don't pass an taskName", function () {
            beforeEach(function () {
                te.runSubtask(null, "description", gruntMock, {});
            });

            it("should not register a task", function () {
                gruntMock.registerTask.called.should.be.false;
            });
        });

        describe("Given I don't pass a config", function () {
            beforeEach(function () {
                te.runSubtask("task", "description", gruntMock, null);
            });
            
            it("should not register a task", function () {
                gruntMock.registerTask.called.should.be.false;
            });
        });
    });
    
    describe("with a valid context", function () {        
        beforeEach(function () {
            te = new require('./../fake/fake.taskengine.te.js').te({
                "parent" : "parent",
                "options" : {
                    "task" : "jsvalidate",
                    "package" : "grunt-jsvalidate"
                }
            });
            
            conf = { "buildstep" : null };

            monkeyPatch.on(te, "createTaskConfig", require('sinon').stub().returns(conf));
            
            gruntMock = builder["grunt"]().withRegisterTask().withInitConfig().build();
            
            te.runSubtask("task", "description", gruntMock, conf);
        });
        
        afterEach(function () {
            monkeyPatch.off(te, "createTaskConfig");
        });
        
        it("should have created a config", function () {
            te.createTaskConfig.calledOnce.should.be.true;
        });
        
        it("should have registered the task as an alias", function () {
            gruntMock.registerTask.calledOnce.should.be.true;
            gruntMock.registerTask.calledWith("parent->task", "description").should.be.true;
        });
    });
});
