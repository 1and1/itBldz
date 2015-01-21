describe("Given I want to decorate a JSON", function () {
    var should = require('should');
    var decorate;
    beforeEach(function () {
        decorate = requireRoot("lib/json/decorate.js");
        decorate = decorate({
            "0" : {
                "0:0" : {
                    "0:0:0" : {}
                },
                "0:1" : {

                }
            },
            "1" : {
                "1:1" : {
                }
            }
        });
    });

    describe("Given I want to add a field to each property in a specified depth", function () {
        var json;

        beforeEach(function () {
            json = decorate.withPropertyForSpecifiedLevels({ "0" : 2, "1" : 0 }, "prop", true).create();
        });

        it("should have added a value", function () {
            should.not.exist(json["0"]["prop"]);
            should.exist(json["0"]["0:0"]["prop"]);
            should.exist(json["0"]["0:0"]["0:0:0"]["prop"]);
            should.not.exist(json["1"]["prop"]);
        });
    });
});