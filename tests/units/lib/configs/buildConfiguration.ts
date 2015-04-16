/// <reference path="../../../../Scripts/typings/mocha/mocha.d.ts" />
/// <reference path="../../../../Scripts/typings/sinon/sinon.d.ts" />
/// <reference path="../../../../Scripts/typings/chai/chai.d.ts" />

import mocha = require('mocha');
import chai = require('chai');
var expect = chai.expect;
import configs = require('../../../../src/lib/configs');
import models = require('../../../../src/lib/models');
var configuration: any;

describe("When loading a build configuration", () => {
    describe("When mapping an empty configuration", () => {
        before(function () {
            configuration = {};
        });

        it("should return an empty result", (done) => {
            var models = new configs.BuildConfigurationService().load(configuration);
            expect(models).to.be.empty;
            done();
        });
    });
    
    describe("When mapping a configuration with a step", () => {
        before(function () {
            configuration = {
                "step": {}
            };
        });

        it("should return the correct step result", (done) => {
            var models = new configs.BuildConfigurationService().load(configuration);
            expect(models).to.have.lengthOf(1);
            expect(models[0].name).to.be.eq("step");
            done();
        });
    });

    describe("When mapping an empty step", () => {
        before(function () {
            configuration = {
            };
        });

        it("should return the correct step result", (done) => {
            var models = new configs.BuildConfigurationService().loadTasks("step", configuration);
            expect(models).to.be.empty;
            done();
        });
    });

    describe("When mapping a step with a build tasks that does not execute a grunt task", () => {
        before(function () {
            configuration = {
                "build-task": {}
            };
        });

        it("should return the correct step result", (done) => {
            var models = new configs.BuildConfigurationService().loadTasks("step", configuration);
            expect(models).to.have.lengthOf(1);
            expect(models[0].name).to.be.eq("build-task");
            expect(models[0].qualifiedName).to.be.eq("step/build-task");
            expect(models[0]._t).to.be.eq("TaskGroup");
            done();
        });
    });

    describe("When mapping a step with a build tasks that executes a grunt task", () => {
        before(function () {
            configuration = {
                "build-task": {
                    "task": "grunt-task",
                    "package" : "grunt-task-package"
                }
            };
        });

        it("should return the correct step result", (done) => {
            var models = new configs.BuildConfigurationService().loadTasks("step", configuration);
            expect(models).to.have.lengthOf(1);
            expect(models[0].name).to.be.eq("build-task");
            expect(models[0].qualifiedName).to.be.eq("step/build-task");
            expect(models[0]._t).to.be.eq("TaskRunner");
            expect((<models.TaskRunner>models[0]).task).to.be.eq("grunt-task");
            expect((<models.TaskRunner>models[0]).package).to.be.eq("grunt-task-package");
            done();
        });
    });

    describe("When mapping a step with a build tasks that does not execute a grunt task and has one nested and one executable subtask", () => {
        var models: models.Task[];

        before(function () {
            configuration = {
                "build-task": {
                    "sub-task-1": {},
                    "sub-task-2": {
                        "task" : "task"
                    }
                }
            };

            models = new configs.BuildConfigurationService().loadTasks("step", configuration);
        });

        it("should return the correct step result", (done) => {
            expect(models).to.have.lengthOf(1);
            expect(models[0].name).to.be.eq("build-task");
            expect(models[0].qualifiedName).to.be.eq("step/build-task");
            expect(models[0]._t).to.be.eq("TaskGroup");
            expect((<models.TaskGroup>models[0]).tasks).to.exist;
            expect((<models.TaskGroup>models[0]).tasks).to.have.lengthOf(2);
            done();
        });

        it("should return the correct nested task", (done) => {
            expect((<models.TaskGroup>models[0]).tasks).to.exist;
            expect((<models.TaskGroup>models[0]).tasks).to.have.lengthOf(2);
            var nestedSubtask = (<models.TaskGroup>models[0]).tasks[0];
            expect(nestedSubtask).to.exist;
            expect(nestedSubtask._t).to.be.eq("TaskGroup");
            expect(nestedSubtask.qualifiedName).to.be.eq("step/build-task/sub-task-1");
            done();
        });

        it("should return the correct executeable task", (done) => {
            expect((<models.TaskGroup>models[0]).tasks).to.exist;
            expect((<models.TaskGroup>models[0]).tasks).to.have.lengthOf(2);
            var execSubtask = <models.TaskRunner>(<models.TaskGroup>models[0]).tasks[1];
            expect(execSubtask).to.exist;
            expect(execSubtask._t).to.be.eq("TaskRunner");
            expect(execSubtask.task).to.be.eq("task");
            expect(execSubtask.qualifiedName).to.be.eq("step/build-task/sub-task-2");
            done();
        });
    });
});