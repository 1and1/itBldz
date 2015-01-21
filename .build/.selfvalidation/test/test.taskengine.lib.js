var should = require('should');
var taskengine = requireRoot('lib/taskengine/aliasing.js');

describe("Given I setup my tasks using the taskengine", function () {

    describe("Given I request the task alias name", function () {

        var createdAlias = taskengine.getAlias("checktype", "targettask");
        it("should return the correct alias for the task", function () {
            should.exist(createdAlias);
            createdAlias.should.be.equal("checktype->targettask");
        });
    });
    
    describe("Given I setup a single task so it is rewritten to the alias", function () {

        var targetTask = "targettask";
        var createdConfig = taskengine.setupTaskAlias({ targetTask: {} }, "checktype", targetTask);
        it("should have removed the old targettask", function () {
            should.exist(createdConfig);
            createdConfig.should.not.have.property(targetTask);
        });

        it("should have added the alias for the new task", function () {
            should.exist(createdConfig);
            createdConfig.should.have.property("checktype->" + targetTask);
        });
    });
    
    describe("Given I setup multiple tasks so they are rewritten to the alias", function () {

        var oldTasks = ["targettask1", "targettask2"];
        var createdConfig = taskengine.setupTaskAlias({ "targettask1": {}, "targettask2": {} }, "checktype", oldTasks);
        it("should have removed the old targettasks", function () {
            should.exist(createdConfig);
            oldTasks.forEach(function (oldTask) {
                createdConfig.should.not.have.property(oldTask);
            });
        });

        it("should have added the alias for the new task", function () {
            should.exist(createdConfig);
            oldTasks.forEach(function (oldTask) {
                createdConfig.should.have.property("checktype->" + oldTask);
            });
        });
    });
});