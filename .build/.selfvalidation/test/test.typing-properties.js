var should = require('should'),
    builder = require('./../mocks/builder'),
    spying = require('sinon');
var properties = requireRoot('lib/typing/properties')();
describe("Given I search for a property", function () {
    var onFound;
    var target;

    beforeEach(function () {
        onFound = spying.spy();
        target = builder["object"]();
    });

    describe("Given I search for null and have a property null", function () {
        beforeEach(function () {
            target = target.withProperty(null, null).build();
            properties.find(target, null, onFound);
        });
        
        it("should not have found the null key (because keys are always strings)", function () {
            onFound.callCount.should.be.exactly(0);
        });
    });

    describe("Given I search for 'null' and have a property null", function () {
        beforeEach(function () {
            target = target.withProperty(null, null).build();
            properties.find(target, "null", onFound);
        });
        
        it("should have found the null key (because keys are always strings)", function () {
            onFound.callCount.should.be.exactly(1);
        });
    });
    
    describe("Given I search for an existing property on the root", function () {
        beforeEach(function () {
            target = target.withProperty("property", null).build();
            properties.find(target, "property", onFound);
        });
        
        it("should have found the property", function () {
            onFound.callCount.should.be.exactly(1);
            onFound.calledWith({ "property" : null }).should.be.true;
        });
    });

    describe("Given I search for an non-existing property on the root", function () {
        beforeEach(function () {
            target = target.withProperty("property", null).build();
            properties.find(target, "missing", onFound);
        });
        
        it("should have found the property", function () {
            onFound.callCount.should.be.exactly(0);
        });
    });
    
    describe("Given I search for an existing property in a leaf", function () {
        beforeEach(function () {
            target = target.withProperty("root", new builder["object"]().withProperty("property", null).build()).build();
            properties.find(target, "property", onFound);
        });
        
        it("should have found the property", function () {
            onFound.callCount.should.be.exactly(1);
            onFound.calledWith({ "property" : null }).should.be.true;
        });
    });

    describe("Given I search for an existing property-set in a leaf", function () {
        beforeEach(function () {
            target = target.withProperty("root", new builder["object"]().withProperty("propertyA", null).withProperty("propertyB", null).build()).build();
            properties.find(target, ["propertyA", "propertyB"], onFound);
        });
        
        it("should have found the property", function () {
            onFound.callCount.should.be.exactly(1);
            onFound.calledWith({ "propertyA" : null, "propertyB" : null }).should.be.true;
        });
    });

    describe("Given I search for a partial existing property-set in a leaf", function () {
        beforeEach(function () {
            target = target.withProperty("root", new builder["object"]().withProperty("propertyA", null).build()).build();
            properties.find(target, ["propertyA", "propertyB"], onFound);
        });
        
        it("should have found the one matching property", function () {
            onFound.callCount.should.be.exactly(1);
            onFound.calledWith({ "propertyA" : null }).should.be.true;
        });
    });
});