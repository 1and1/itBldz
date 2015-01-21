describe("Given I want to test add module", function () {
    var should = require('should'),
        arg = {
            "module" : "",
            "task" : "",
            "package" : "",
            "description" : null
        },
        add,
        builder = requireTestRoot('mocks/builder'),
        fs,
        spying = require('sinon');
    beforeEach(function () {
        fs = builder["fs"]();
    });
    
    var prepareAdd = function () {
        add = rewireRoot(".bpm/add.js");
        add.__set__('logger', { log : function () { }, verbose : function () { } });
        fs = fs.build();
        add.__set__('fs', fs);
        add = add(null, arg);
    };
    
    describe("Given I want to start the add task", function () {
        beforeEach(function () {
            fs = fs.withReadFile(spying.spy());
            prepareAdd();
            add.do();
        });
        
        it("should read the template file", function () {
            fs.readFile.calledOnce.should.be.true;
        });
    });

    describe("Given I want to parse the template with errors", function () {
        var data = "", exception;
        beforeEach(function () {
            prepareAdd();
            add.setupModulePath = spying.stub().yields();
            try {
                data = add.parseTemplate("bad error");
            } catch (err) {
                exception = err;
            }
        });
        
        it("should not add a line at the beginning with the data", function () {
            data.should.be.exactly("");
        });
        
        it("should throw an exception", function () {
            should.exist(exception);
        });

        it("should not have tried to setup module path", function () {
            add.setupModulePath.calledOnce.should.be.false;
        });
    });
    
    describe("Given I want to parse the template with errors after setup", function () {
        var should = require('should');
        var data = "", exception;
        beforeEach(function () {
            fs = fs.withWriteFile(spying.stub().yields("bad error"));
            prepareAdd();
            add.setupModulePath = spying.stub().yields();

            try {
                data = add.parseTemplate(null, data);
            } catch (err) {
                exception = err;
            }
        });

        it("should throw an exception", function () {
            should.exist(exception);
        });

        it("should have tried to setup module path", function () {
            add.setupModulePath.calledOnce.should.be.true;
        });
    });
    
    describe("Given I want to parse the template without errors", function () {
        var data = "", exception;
        beforeEach(function () {
            prepareAdd();
            add.setupModulePath = spying.stub().yields();
            try {
                data = add.parseTemplate(null, data);
            } catch (err) {
                exception = err;
            }
        });
        
        it("should add a line at the beginning with the data", function () {
            data.indexOf('var data').should.be.exactly(0);
        });
        
        it("should not throw an exception", function () {
            should.not.exist(exception);
        });
    });
    
    describe("Given I want to setup the module path", function () {
        var onDone = function (data) { dir = data; }, dir = "dir";

        describe("Given I do this with an empty tree", function () {
            beforeEach(function () {
                prepareAdd();
                add.setupModulePath(dir, null, onDone);
            });

            it("should return the current dir", function () {
                dir.should.be.exactly("dir");
            });
        });

        describe("Given I do this with a tree with items", function () {
            beforeEach(function () {
                prepareAdd();
                add.setupModulePath(dir, ["1"], onDone);
            });
            
            it("should return the stacked dir", function () {
                dir.should.be.exactly("dir/1");
            });
        });
    });
});