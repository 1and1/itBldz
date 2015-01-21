describe("Given I want to test setup module", function () {
    var should = require('should'),
        originalArgs = {
            "config" : "",
            "verbose": false
        },
        arg = {
            setup : function () {
                return originalArgs;
            },
            parse : function () {
            }
        },
        setup,
        builder = requireTestRoot('mocks/builder'),
        fs,
        spying = require('sinon'),
        add;

    beforeEach(function () {
        fs = builder["fs"]();
    });
    
    var prepareSetup = function () {
        setup = rewireRoot(".bpm/setup.js");
        setup.__set__('log', function () { });
        fs = fs.build();
        setup.__set__('fs', fs);
        setup.__set__('args', arg);
        add = spying.stub().returns({ "do" : spying.stub() });
        setup.__set__('addModule', add);
        setup = setup(originalArgs);
    };
    
    var spySelf = {
        fields : {},
        on : function (field) {
            spySelf.fields[field] = setup[field];
            setup[field] = spying.spy();
        },
        off : function () {
            Object.keys(spySelf.fields).forEach(function (field) {
                setup[field] = spySelf.fields[field];
            });

            spySelf.fields = {};
        }
    };

    describe("Given I trigger the setup", function () {
        var readFile = spying.spy();

        beforeEach(function () {
            fs.withReadFile(readFile);
            prepareSetup();
            setup.do();
        });

        it("should have read the config file", function () {
            readFile.calledOnce.should.be.true;
        });
    });

    describe("Given I parse the build config", function () {
                
        describe("Given an error has occured", function () {
            var mkdir = spying.spy();
            var exception;
            beforeEach(function () {
                fs.withMkdir(mkdir);
                prepareSetup();
                try {
                    setup.parseBuildConfig("bad error");
                } catch (err) {
                    exception = err;
                }
            });

            it("should have thrown an exception", function () {
                should.exist(exception);
            });

            it("should not tried to make a dir", function () {
                mkdir.called.should.be.false;
            });
        });
        
        describe("Given no error has occured", function () {
            var exception;
            beforeEach(function () {

                prepareSetup();
                setup.decorationStrategy = function (data) { return data; };
                spySelf.on("addBuildStepTemplate");
                spySelf.on("loadTasks");

                try {
                    setup.parseBuildConfig(null, { "1" : {}, "2" : {} });
                } catch (err) {
                    exception = err;
                }
            });
            
            afterEach(function () {
                spySelf.off();
            });
            
            it("should not have thrown an exception", function () {
                should.not.exist(exception);
            });
            
            it("should have tried to make a dir for each build step", function () {
                fs.mkdir.calledTwice.should.be.true;
            });
            
            it("should have added the build step template for each key", function () {
                setup.addBuildStepTemplate.calledTwice.should.be.true;
            });

            it("should have loaded the subtasks for each build step", function () {
                setup.loadTasks.calledTwice.should.be.true;
            });
        });
    });
    
    describe("Given I load all the tasks", function () {
        var exception, loadTask;

        beforeEach(function () {
            prepareSetup();
            spySelf.on("loadTask");
            
            try {
                setup.loadTasks(null, { "1" : {}, "2" : {} });
            } catch (err) {
                exception = err;
            }
        });
                
        afterEach(function () {
            spySelf.off();
        });
        
        it("should not have thrown an exception", function () {
            should.not.exist(exception);
        });
        
        it("should have loaded each task", function () {
            setup.loadTask.calledTwice.should.be.true;
        });
    });

    describe("Given I load a task", function () {
        var task = {
            "js": {
                "__isTask" : true,
                "task": "jshint",
                "package": "grunt-contrib-jshint",
                "files": ["<%= config.filesets.js.sources %>"],
                "options": "<%= config.validation.semantic.js %>"
            }
        };

        describe("Given the task should not be generated", function () {

            beforeEach(function () {
                task.js.__isTask = false;
                setup.loadTask("dir", task, "js");
            });

            it("should not add it as a module", function () {
                add.called.should.be.false;
            });
        });
        
        describe("Given the task should be generated", function () {

            beforeEach(function () {
                task.js.__isTask = true;
                setup.loadTask("dir", task, "js");
            });

            it("should add it as a module", function () {
                add.calledOnce.should.be.true;
            });
        });
    });
});