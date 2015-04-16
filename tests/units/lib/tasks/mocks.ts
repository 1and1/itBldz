
import sinon = require('sinon');
import gruntbase = require('../../../../src/lib/grunt');
import tasks = require('../../../../src/lib/tasks');

export interface MockedGruntInstance {
    registerTask: SinonSpy;
    initConfig: SinonSpy;
    task: {
        run: SinonSpy;
    };
}

export class GruntMock extends gruntbase.Grunt {
    mock: MockedGruntInstance;

    public constructor() {
        this.mock = {
            registerTask: sinon.spy(),
            initConfig: sinon.spy(),
            task: {
                run : sinon.spy()
            }
        };
        super(this.mock);
    }
}

export class TaskRegisterServiceMock {
    mock: SinonMock;

    public constructor() {
    }

    public static get(): tasks.TaskRegisterService {
        var service = {
            registerTask: sinon.spy()
        };

        return <tasks.TaskRegisterService><any>service;
    }
}