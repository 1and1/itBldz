var should = require('should'),
    builder = require('./../mocks/builder');
var js = requireRoot('lib/taskengine/configuration');

describe("Given I want to get the configuration for a specified task", function () {
    describe("And I have no instance of grunt", function () {
        var error;
        
        before(function () {
            try {
                js.getConfig(null, null);
            } catch (err) {
                error = err;
            }
        });
        
        it("should throw an exception", function () {
            should.exist(error);
        });
    });
    
    describe("And I have an instance of grunt", function () {
        
        var grunt;

        beforeEach(function () {
            var config = builder["config"]().withProperty("parent", { "child" : { "current" : "config" } }).asFunction().build();
            grunt = builder["grunt"]().withConfig(config).build();
        });
        
        describe("But the configuration is not initialized", function () {
            var error;
            
            before(function () {
                try {
                    js.getConfig(builder["grunt"]().build(), null);
                } catch (err) {
                    error = err;
                }
            });
            
            it("should throw an exception", function () {
                should.exist(error);
            });
        });
        
        describe("And I have no current tree for the configuration", function () {
            var error;
            
            before(function () {
                try {
                    js.getConfig(grunt, null);
                } catch (err) {
                    error = err;
                }
            });
            
            it("should throw an exception", function () {
                should.exist(error);
            });
        });
        
        describe("And the tree does not exist in the configuration", function () {
            var error, result;
            
            before(function () {
                try {
                    result = js.getConfig(grunt, [ "nonexisting", "item" ]);
                } catch (err) {
                    error = err;
                }
            });
            
            it("should not throw an exception", function () {
                should.not.exist(error);
            });
            
            it("should return no result", function () {
                should.not.exist(result);
            });
        });
        
        describe("And the tree exists in the configuration", function () {
            var error, result = null;
            
            before(function () {
                try {
                    result = js.getConfig(grunt, ["parent", "child"]);
                } catch (err) {
                    error = err;
                }
            });

            it("should not throw an exception", function () {
                should.not.exist(error);
            });
            
            it("should return a valid result", function () {
                should.exist(result);
                should.exist(result.current);
                result.current.should.be.exactly("config");
            });
        });
    });
});

describe("Given I pass an configuration to the task config creation", function () {
    
    var defaultRunner = 'jsvalidate';
    describe("Given I provide no task runner", function () {
        var createdConfig = js.createConfig({}, defaultRunner);
        it("should return a configuration", function () {
            should.exist(createdConfig);
        });
        it("should return a configuration running the default task", function () {
            createdConfig.should.have.property(defaultRunner);
        });
    });
    
    describe("Given I provide an empty task runner", function () {
        var createdConfig = js.createConfig({ "task" : "" }, defaultRunner);
        it("should return a configuration", function () {
            should.exist(createdConfig);
        });
        it("should return a configuration running the default task", function () {
            createdConfig.should.have.property(defaultRunner);
        });
    });
    
    describe("Given I provide an invalid task runner", function () {
        var createdConfig, error;
        try {
            createdConfig = js.createConfig({ "task" : 0 }, defaultRunner);
        } catch (e) { error = e; }
        it("should not return a configuration", function () {
            should.not.exist(createdConfig);
        });
        it("should have thrown an error", function () {
            should.exist(error);
        });
    });
    
    describe("Given I provide a specific task runner", function () {
        var myRunner = "myjs";
        var createdConfig = js.createConfig({ "task" : myRunner, "package" : "some package" }, defaultRunner);
        it("should return a configuration", function () {
            should.exist(createdConfig);
        });
        it("should return a configuration running the specified task", function () {
            createdConfig.should.have.property(myRunner);
        });
        it("should return remove the task configuration from the options", function () {
            createdConfig[myRunner].should.not.have.property("task");
        });
        it("should return remove the task configuration from the options", function () {
            createdConfig[myRunner].should.not.have.property("package");
        });
    });
    
    describe("Given I provide options", function () {
        var createdConfig = js.createConfig({ options: ["lala"] }, defaultRunner);
        it("should return a configuration", function () {
            should.exist(createdConfig);
        });
        it("should return a configuration with the default task", function () {
            createdConfig.should.have.property(defaultRunner);
        });
        it("should append the options", function () {
            should.exist(createdConfig[defaultRunner].options);
            createdConfig[defaultRunner].options.length.should.be.exactly(1);
            createdConfig[defaultRunner].options[0].should.be.equal("lala");
        });
    });
});
