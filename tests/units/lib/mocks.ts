import sinon = require('sinon');
import gruntbase = require('../../../src/lib/grunt');
import tasks = require('../../../src/lib/tasks');
import configs = require('../../../src/lib/configs');

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

export class ConfigurationServiceMock {
    public static get(): configs.BuildConfigurationService {
        var service = {
            load: sinon.stub().yields([]),
            loadTasks: sinon.spy()
        };

        return <configs.BuildConfigurationService><any>service;
    }
}

export class TaskServiceMock {
    public static getConfigTaskRegistrationService(): tasks.ConfigTaskRegistrationService {
        var service = {
            register: sinon.spy()
        };

        return <tasks.ConfigTaskRegistrationService><any>service;
    }
    public static getTaskRegisterService(): tasks.TaskRegisterService {
        var service = {
            registerTask: sinon.spy()
        };

        return <tasks.TaskRegisterService><any>service;
    }
}