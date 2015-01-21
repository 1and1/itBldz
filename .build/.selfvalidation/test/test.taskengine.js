var should = require('should'),
    monkeyPatch = require('./../monkey/patch'),
    builder = require('./../mocks/builder'),
    rewire = require('rewire');
var te, grunt, env;

var buildstep = "buildstep";

describe("Given I want to run a build-task", function () {
    
    before(function () {
        var config = builder["config"]().withProperty(buildstep).asFunction().build();
        grunt = builder["grunt"]().withConfig(config).withRegisterTask().withInitConfig().build();
        te = rewireRoot('taskengine');
        env = builder["taskengine.lib"]().withLoadTaskDirectories().withSetupTaskAlias().build();
        te.__set__('env', env);
        te.__set__('alias', env);
        te.__set__('conf', builder["config"]().withRun().withLog().build());
    });
        
    var context;
    describe("Given I startup the taskEngine", function () {
        describe("And I forgot to pass an argument", function () {

            var _exception;
            before(function () {
                try {
                    context = te.startup();
                } catch (err) {
                    _exception = err;
                }
            });

            it("should have thrown an exception", function () {
                should.exist(_exception);
            });

            it("should not return a context", function () {
                should.not.exist(context);
            });
        });
        
        describe("And I forgot to pass an instance of grunt", function () {
            
            var _exception;
            before(function () {
                try {
                    context = te.startup({
                        "grunt" : null, 
                        "buildStep" : buildstep, 
                        "path" : __dirname
                    });
                } catch (err) {
                    _exception = err;
                }
            });
            
            it("should have thrown an exception", function () {
                should.exist(_exception);
            });
            
            it("should not return a context", function () {
                should.not.exist(context);
            });
        });
        
        describe("And I forgot to pass a build-step", function () {
            
            var _exception;
            before(function () {
                try {
                    context = te.startup({
                        "grunt" : grunt, 
                        "buildStep" : null, 
                        "path" : __dirname
                    });
                } catch (err) {
                    _exception = err;
                }
            });
            
            it("should have thrown an exception", function () {
                should.exist(_exception);
            });
            
            it("should not return a context", function () {
                should.not.exist(context);
            });
        });
        
        describe("And I forgot to pass a path", function () {
            
            var _exception;
            before(function () {
                try {
                    context = te.startup({
                        "grunt" : grunt, 
                        "buildStep" : buildstep, 
                        "path" : null
                    });
                } catch (err) {
                    _exception = err;
                }
            });
            
            it("should have thrown an exception", function () {
                should.exist(_exception);
            });
            
            it("should not return a context", function () {
                should.not.exist(context);
            });
        });
        
        describe("And the startup-context is valid", function () {            
            var _exception;
            before(function () {
                try {
                    context = te.startup({
                        "grunt" : grunt, 
                        "buildStep" : buildstep, 
                        "path" : __dirname
                    });
                } catch (err) {
                    _exception = err;
                }
            });
            
            it("should not have thrown an exception", function () {
                should.not.exist(_exception);
            });
            
            it("should return a context", function () {
                should.exist(context);
            });

            it("should have loaded the task directory", function () {
                env.loadTaskDirectories.calledOnce.should.be.true;
            });

            it("should have setup the task aliases", function () {
                env.setupTaskAlias.calledOnce.should.be.true;
            });
        });

        describe("Given I run the taskEngine", function () {
            describe("And do not pass a context", function () {
                var _exception;
                before(function () {
                    try {
                        te.run();
                    } catch (err) {
                        _exception = err;
                    }
                });

                it("should have thrown an exception", function () {
                    should.exist(_exception);
                });
            });
            
            describe("And do not pass an instance of grunt", function () {
                var _exception;
                before(function () {
                    try {
                        te.run({ grunt : null});
                    } catch (err) {
                        _exception = err;
                    }
                });
                
                it("should have thrown an exception", function () {
                    should.exist(_exception);
                });
            });

            describe("And do not pass a name", function () {
                var _exception;
                before(function () {
                    try {
                        te.run({ grunt : {}, name: null });
                    } catch (err) {
                        _exception = err;
                    }
                });
                
                it("should have thrown an exception", function () {
                    should.exist(_exception);
                });
            });

            describe("With a valid context", function () {
                var _exception;
                before(function () {
                    try {
                        te.run({
                            "grunt" : grunt, 
                            "name" : buildstep,
                            "config" : { buildstep : null }
                        }, "description");
                    } catch (err) {
                        _exception = err;
                    }
                });
                
                it("should not have thrown an exception", function () {
                    should.not.exist(_exception);
                });
                
                it("should have registered the correct task", function () {
                    grunt.registerTask.calledOnce.should.be.true;
                    grunt.registerTask.calledWith(buildstep, "description").should.be.true;
                });

                it("should have initialized the config", function () {
                    grunt.initConfig.calledOnce.should.be.true;
                });
            });
        });
        /*
        var taskContext = taskengine.startup({
            "grunt" : grunt, 
            "buildStep" : path.basename(__filename, ".js"), 
            "path" : __dirname
        });
        
        taskengine.run(taskContext, 'Automatic code validation.');
         */
    });
});
