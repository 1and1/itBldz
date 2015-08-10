/// <reference path="../../../Scripts/typings/mocha/mocha.d.ts" />
/// <reference path="../../../Scripts/typings/chai/chai.d.ts" />
import mocha = require('mocha');
import chai = require('chai');

import engines = require('../../../src/lib/Engine');
import mocks = require('./mocks');
var expect = chai.expect;
var configuration;

describe("When starting a build engine", () => {
    var grunt: mocks.GruntMock;
    var buildConfiguration;
    var configTaskRegistrationSevice;
    var engine: engines.BuildEngine;

    beforeEach(function () {
        grunt = new mocks.GruntMock();
        buildConfiguration = mocks.ConfigurationServiceMock.get();
        configTaskRegistrationSevice = mocks.TaskServiceMock.getConfigTaskRegistrationService();
        engine = new engines.BuildEngine(grunt, buildConfiguration, configTaskRegistrationSevice);
    });

    describe("When mapping an empty configuration", () => {
        var results: string[];

        beforeEach(function (done) {
            configuration = {};
            engine.startUp(configuration, (tasks) => {
                results = tasks;
                done();
            });
        });

        it("should return an empty result", (done) => {
            expect(results).to.be.empty;
            done();
        });
        
        it("should have registered the config", (done) => {
            expect((<SinonSpy>configTaskRegistrationSevice.register).called).to.be.true;
            done();
        });
    });

    describe("When mapping an configuration with a step", () => {
        var results: string[];

        beforeEach(function (done) {
            configuration = { "step": {} };
            engine.startUp(configuration, (tasks) => {
                results = tasks;
                done();
            });
        });

        it("should return an empty result", (done) => {
            expect(results).to.be.empty;
            done();
        });

        it("should have registered the config", (done) => {
            expect((<SinonSpy>configTaskRegistrationSevice.register).called).to.be.true;
            done();
        });
    });

    describe("When mapping an configuration with a step with a task", () => {
        var results: string[];

        beforeEach(function (done) {
            configuration = { "step": { "task": {} } };
            engine.startUp(configuration, (tasks) => {
                results = tasks;
                done();
            });
        });

        it("should return an empty result", (done) => {
            expect(results).to.be.empty;
            done();
        });

        it("should have registered the config", (done) => {
            expect((<SinonSpy>configTaskRegistrationSevice.register).called).to.be.true;
            done();
        });
    });
});
