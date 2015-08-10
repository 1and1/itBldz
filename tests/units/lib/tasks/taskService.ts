/// <reference path="../../../../Scripts/typings/mocha/mocha.d.ts" />
/// <reference path="../../../../Scripts/typings/chai/chai.d.ts" />
/// <reference path="../../../../Scripts/typings/sinon/sinon.d.ts" />

import mocha = require('mocha');
import chai = require('chai');
import sinon = require('sinon');
var expect = chai.expect;
import tasks = require('../../../../src/lib/tasks');
import models = require('../../../../src/lib/models');
import mocks = require('../mocks');
var configuration: any;
var grunt : mocks.GruntMock;

describe("When registering a configuration", () => {
    var taskRegisterService: tasks.TaskRegisterService;
    var taskConfigurationRegisterService: tasks.ConfigTaskRegistrationService;

    beforeEach(() => {
        grunt = new mocks.GruntMock();
        taskRegisterService = mocks.TaskServiceMock.getTaskRegisterService();
        taskConfigurationRegisterService = new tasks.ConfigTaskRegistrationService(grunt, taskRegisterService);
    });

    describe("When the configuration is empty", () => {
        beforeEach(() => {
            taskConfigurationRegisterService.register({ steps: [] });
        });

        it("should not have registered anything", () => {
            expect(grunt.mock.registerTask.notCalled).to.be.true;
        });
    });

    describe("When the configuration has steps and tasks", () => {
        beforeEach(() => {
            taskConfigurationRegisterService.register({ steps: [{ name: "step1", tasks: [new models.TaskGroup()] }, { name: "step2", tasks: [new models.TaskGroup()] }] });
        });

        it("should have registered all steps", () => {            
            expect(grunt.mock.registerTask.called).to.be.true;
            expect(grunt.mock.registerTask.calledTwice).to.be.true;
        });

        it("should have registered all inner tasks", () => {
            expect((<SinonSpy><any>taskRegisterService.registerTask).calledTwice).to.be.true;
        });
    });
});

describe("When registering a task group", () => {
    var taskRegisterService: tasks.TaskRegisterService = new tasks.TaskRegisterService(grunt);

    beforeEach(() => {
        grunt = new mocks.GruntMock();
        taskRegisterService = new tasks.TaskRegisterService(grunt);
    });

    describe("When the configuration is empty", () => {
        beforeEach(() => {
            taskRegisterService.registerTask(null);
        });

        it("should not have registered anything", () => {
            expect(grunt.mock.registerTask.notCalled).to.be.true;
        });
    });

    describe("When the configuration has only a task group", () => {
        beforeEach(() => {
            var taskGroup = new models.TaskGroup();
            taskGroup.tasks = [];
            taskRegisterService.registerTask(taskGroup);
        });

        it("should have registered the task group", () => {
            expect(grunt.mock.registerTask.calledOnce).to.be.true;
        });
    });
    describe("When the configuration has only a task runner", () => {
        beforeEach(() => {
            var taskRunner = new models.TaskRunner();
            taskRegisterService.registerTask(taskRunner);
        });

        it("should have registered the task once", () => {
            expect(grunt.mock.registerTask.calledOnce).to.be.true;
        });
    });

    describe("When the configuration has a task group that has a runner", () => {
        beforeEach(() => {
            var taskGroup = new models.TaskGroup();
            taskGroup.tasks = [new models.TaskRunner()];
            taskRegisterService.registerTask(taskGroup);
        });

        it("should have registered the task once", () => {
            expect(grunt.mock.registerTask.calledOnce).to.be.true;
        });
    });
});