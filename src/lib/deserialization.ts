import logging = require('./logging');
import fs = require('fs');
import path = require('path');
var log = new logging.Log();

interface IDeserializeAType {
    type : RegExp;
    deserialize(type, value, call) : any;
}

class DeserializationHelper {
    public static toObject(value) {
        var data = value;
        if (Object.prototype.toString.call(value) === "[object String]") {
            data = JSON.parse(value);
        }
        
        return data;
    }
}

class DeserializeFunction implements IDeserializeAType {
    type : RegExp = /^Function$/gi;
    public deserialize(type, value, call) {       
        try {
            var data = DeserializationHelper.toObject(value);
            var script = require(path.join(global["basedir"], data.src));
            return script[call];
        }
        catch(err) {
            throw err;
        }
    }
}

class DeserializeIIFE extends DeserializeFunction {
    type : RegExp = /^IIFE/gi;
    public deserialize(type, value, call) {
       return (super.deserialize(type, value, call))();
    }
}

class DeserializeRegex implements IDeserializeAType {
    type : RegExp = /^RegExp$/gi;
    public deserialize(type, value, call) {
        try {
            var data = DeserializationHelper.toObject(value);                
            return new RegExp(data.pattern, data.flags);
        }
        catch(err) {
            return new RegExp(value);
        }
    }
}

class DeserializeModule implements IDeserializeAType {
    type : RegExp = /^modules\./gi;
    modules;
    
    constructor(modules) {
        this.modules = modules;
    }
    
    public deserialize(type : string, value : string, call : string) {
        type = type.replace(this.type, "");
        log.verbose.writeln("DeserializeModule", "Deserializing module " + type + "...");
        var currentModule = this.modules[type];
        var self = this;
        
        if (!currentModule) throw new Error("A module that was specified could not be loaded. Module: " + type);
        if (currentModule.deserialize) {
            return function() { currentModule.deserialize(value); return currentModule[call].apply(currentModule, arguments); };
        }
        
        try {
            var valueAsObject = DeserializationHelper.toObject(value);
            log.verbose.writeln("DeserializeModule", "Applying " + JSON.stringify(value) + " to " + JSON.stringify(currentModule));
            Object.keys(valueAsObject).forEach((key) => {
               currentModule[key] = valueAsObject[key];
            });
            log.verbose.writeln("DeserializeModule", "Result: " + JSON.stringify(currentModule));
            
            return function () { return currentModule[call].apply(currentModule, arguments); };
        } catch (err) {}
        
        return function () { return currentModule[call].apply(currentModule, arguments); };
    }
}

class EmptyDeserializer implements IDeserializeAType {
    type;
    public deserialize(type, value, call) {
        return value;
    }
}

class DeserializerFactory {
    deserializers : IDeserializeAType[] = [new DeserializeRegex()];
        
    public constructor(modules) {
        this.deserializers.push(new DeserializeFunction());
        this.deserializers.push(new DeserializeIIFE());
        this.deserializers.push(new DeserializeModule(modules));
    }
        
    public get(type : string) : IDeserializeAType {
        log.verbose.writeln("DeserializerFactory", "Testing type " + type);
        return this.deserializers.filter((item) => item.type.test(type))[0] || 
            new EmptyDeserializer();
    }
}

export class ConfigurationTypeDeserializer {
    deserializerFactory : DeserializerFactory;
    
    public constructor(modules) { 
        this.deserializerFactory = new DeserializerFactory(modules);
    }
    
    private serializeByDisriminator(type, value, call) : any {
        return this.deserializerFactory.get(type).deserialize(type, value, call);
    }
    
    private forEachKeyIn(object) : any {
        if (Array.isArray(object)){
            for (var index = 0; index < object.length; index++) {
                object[index] = this.forEachKeyIn(object[index]);
            }
            
            return object;
        }
        
        if (object !== Object(object)) return object;
        log.verbose.writeln("ConfigurationTypeDeserializer", "Current object: " + JSON.stringify(object));
        if (object["serialized:type"]) {
            var serialized = this.serializeByDisriminator(object["serialized:type"], 
                object["serialized:object"], 
                object["serialized:call"]);
            log.verbose.writeln("ConfigurationTypeDeserializer", "Serialized " + object["serialized:type"] + " to " + JSON.stringify(serialized, 
                (key, val) => (typeof val === 'function') ? val + '' : val));
            return serialized;
        } else if (object[":type"]) {
            var serialized = this.serializeByDisriminator(object[":type"]["type"], 
                object[":type"]["object"], 
                object[":type"]["call"]);
            log.verbose.writeln("ConfigurationTypeDeserializer", "Serialized " + object[":type"]["type"] + " to " + JSON.stringify(serialized, 
                (key, val) => (typeof val === 'function') ? val + '' : val));
            return serialized;
        } 
        
        var result = {};
        
        Object.keys(object).forEach((key) => {
            result[key] = this.forEachKeyIn(object[key]);
        });
        
        return result;
    }
    
    public transform(config) : any {
        return this.forEachKeyIn(config);
    }
}