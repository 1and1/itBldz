module.exports.te = function (options) {
    var should = require('should'),
        monkeyPatch = require('./../monkey/patch'),
        builder = require('./../mocks/builder'),
        spying = require('sinon');
    var te, gruntMock;
    
    var taskengine = {
        env : {},
        conf : {
            createConfig : spying.stub().yields()
        },
        alias : {
            getAlias : spying.stub().returns("parent->task")
        },
        pck : {
            loadPackage: spying.spy()
        }
    };

    te = new rewireRoot('lib/taskengine/te');
    
    te.__set__('taskengine', taskengine);

    te.__set__('conf', builder["config"]().withLog().build());
    
    te = te(options);

    return te;
};