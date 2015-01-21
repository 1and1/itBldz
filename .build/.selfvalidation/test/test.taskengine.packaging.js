var should = require('should'),
    builder = require('./../mocks/builder'),
    spying = require('sinon');
var taskengine = rewireRoot('lib/taskengine/packaging.js');

describe("Given I load my tasks using the taskengine", function () {
    var gruntMock,
        installNpmPackage = spying.spy(),
        npmMock = function () { return { installNpmPackages: installNpmPackage } };

    taskengine.__with__({
        'npmTask' : npmMock
    })(function () {

        describe("Given I pass no package", function () {
            before(function () {
                gruntMock = builder["grunt"]().withLoadNpmTasks().build();
                taskengine.loadPackage(gruntMock);
            });

            it("should not load a package", function () {
                gruntMock.loadNpmTasks.called.should.be.false;
            });
        });

        describe("Given I pass a valid package", function () {
            var pkg = "mypackage";
            before(function () {
                gruntMock = builder["grunt"]().withLoadNpmTasks().build();
                taskengine.loadPackage(gruntMock, pkg);
            });
            
            it("should load the package", function () {
                gruntMock.loadNpmTasks.called.should.be.true;
                gruntMock.loadNpmTasks.calledWith(pkg).should.be.true;
            });
        });
    });
});