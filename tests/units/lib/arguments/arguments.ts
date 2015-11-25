import mocha = require('mocha');
import chai = require('chai');
var expect = chai.expect;
import args from '../../../../src/lib/arguments';


describe("When having configuration arguments", () => {
    var config: string;
    var result : string;
    
    beforeEach(() => {
       config = "myconfig";
       result = "";
    });

    describe("and the argument has a valid file extension", () => {
        describe("and the file extension is json", () => {
            beforeEach(function() {
                config = config + ".json";
                result = args.getConfigArgument(config);
            });
            it("should return the same argument", (done) => {
                expect(result).to.be.eq(config);
                done();
            });
        });
        describe("and the file extension is yml", () => {
            beforeEach(function() {
                config = config + ".yml";
                result = args.getConfigArgument(config);
            });
            it("should return the same argument", (done) => {
                expect(result).to.be.eq(config);
                done();
            });
        });
    });
    
    describe("and the argument has no valid file extension", () => {
        describe("and no default file extension is provided", () => {
            beforeEach(function() {
                result = args.getConfigArgument(config);
            });
            it("should return a json config", (done) => {
                expect(result, `Expected ${result} to be ${config}.json`).to.be.eq(config + ".json");
                done();
            });
        });
        describe("and the default file extension is json", () => {
            beforeEach(function() {
                result = args.getConfigArgument(config, ".json");
            });
            it("should return a json config", (done) => {
                expect(result, `Expected ${result} to be ${config}.json`).to.be.eq(config + ".json");
                done();
            });
        });
        describe("and the default file extension is yml", () => {
            beforeEach(function() {
                result = args.getConfigArgument(config, ".yml");
            });
            it("should return the same argument", (done) => {
                expect(result, `Expected ${result} to be ${config}.yml`).to.be.eq(config + ".yml");
                done();
            });
        });
    });
});
