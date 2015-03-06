var should = require('should'),
    builder = require('./../mocks/builder'),
    rewire = require('rewire');
var grunt = builder["grunt"]().build();
var createPackageReference = function (name) {
    return name;
};

describe('Given I want to npm a package', function () {
    
    describe('Given npm loads with an error', function () {

        var npm, commandMock, npmMock;
        beforeEach(function () {
            npm = rewireRoot('lib/packaging/npm-task');
            commandMock = builder["npm-commands"]().withInstall().withLs().build();
            npmMock = builder["npm"]().withLoadError().withCommands(commandMock).build();

            npm.__set__('npm', npmMock);
            npm = npm(grunt);
            npm.installIfFileNotExist = require('sinon').spy();
            npm.installNpmPackages([createPackageReference("npm")]);
        });

        it('should not have queried for npm packages', function () {
            commandMock.ls.calledOnce.should.be.false;
        });
        
        it('should not have installed npm packages that does not exist', function () {
            npm.installIfFileNotExist.calledOnce.should.be.false;
        });
    });
    
    describe('Given npm can load without errors', function () {
        
        var npm, commandMock, npmMock;
        beforeEach(function () {
            npm = rewireRoot('lib/packaging/npm-task');
            commandMock = builder["npm-commands"]().withInstall().withLs().build();
            npmMock = builder["npm"]().withLoad().withCommands(commandMock).build();
            npm.__set__('npm', npmMock);
            npm = npm(grunt);
            npm.installIfFileNotExist = require('sinon').spy();
            npm.installNpmPackages([createPackageReference("npm")]);
        });
        
        it('should have queried for npm packages', function () {
            commandMock.ls.calledOnce.should.be.true;
        });
        
        it('should have installed npm packages that does not exist', function () {
            npm.installIfFileNotExist.calledOnce.should.be.true;
        });
    });
});

describe('Given I want to load a package with clean dependencies', function () {
    var commandMock;
    beforeEach(function () {
        var npm = rewireRoot('lib/packaging/npm-task');
        commandMock = builder["npm-commands"]().withInstall().withLs().build();
        var npmMock = builder["npm"]().withLoad().withCommands(commandMock).build();
        npm.__set__('npm', npmMock);
        npm = npm(grunt);
        npm.installIfFileNotExist(npmMock, [createPackageReference("npm")], null);
    });
    
    it('should install the package', function () {
        commandMock.install.callCount.should.be.exactly(1);
    });
});

describe('Given I want to install no packages', function () {
    var commandMock;
    beforeEach(function () {
        var npm = rewireRoot('lib/packaging/npm-task');
        commandMock = builder["npm-commands"]().withInstall().withLs().build();
        var npmMock = builder["npm"]().withLoad().withCommands(commandMock).build();
        npm.__set__('npm', npmMock);
        npm = npm(grunt);
        npm.installIfFileNotExist(npmMock, [], { dependencies : {} });
    });
    
    it('should not install anything', function () {
        commandMock.install.callCount.should.be.exactly(0);
    });
});

describe('Given I want to load a package that is not installed', function () {
    var commandMock;
    beforeEach(function () {
        var npm = rewireRoot('lib/packaging/npm-task');
        commandMock = builder["npm-commands"]().withInstall().withLs().build();
        var npmMock = builder["npm"]().withLoad().withCommands(commandMock).build();        
        npm.__set__('npm', npmMock);
        npm = npm(grunt);
        npm.installIfFileNotExist(npmMock, [createPackageReference("npm")], { dependencies : {} });
    });

    it('should install the package', function () {
        commandMock.install.callCount.should.be.exactly(1);
    });
});

describe('Given I want to run npm while it is already running', function () {
    var commandMock;
    beforeEach(function () {
        var npm = rewireRoot('lib/packaging/npm-task');
        commandMock = builder["npm-commands"]().withInstall().withLs().build();
        var npmMock = builder["npm"]().withLoad().withCommands(commandMock).build();
        npm.__set__('npm', npmMock);
        npm = npm(grunt);
        npm.isRunning = true;
        npm.installIfFileNotExist(npmMock, [createPackageReference("npm")], { dependencies : {} });
    });
    
    it('should not install the package', function () {
        commandMock.install.callCount.should.be.exactly(0);
    });
});

describe('Given I want to load a package that is installed', function () {
    var commandMock;
    beforeEach(function () {
        var npm = rewireRoot('lib/packaging/npm-task');
        var ls = function (a, b, c) { c(null, { dependencies : { "npm" : {} } }); };
        commandMock = builder["npm-commands"]().withInstall().withLs(ls).build();
        var npmMock = builder["npm"]().withLoad().withCommands(commandMock).build();        
        
        npm.__set__('npm', npmMock);
        npm = npm(grunt);
        npm.installIfFileNotExist(npmMock, [createPackageReference("npm")], { dependencies : { "npm" : {} } });
    });

    it('should not install the package', function () {
        commandMock.install.callCount.should.be.exactly(0);
    });
});