import logging = require('./logging');
var log = new logging.Log();

interface IExecuteAFunction {
    type : RegExp;
    handle(object : any) : any;
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

abstract class ReplacingFunction implements IExecuteAFunction {
    type : RegExp;
    resolve(object, query) {
        query = query.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        query = query.replace(/^\./, '');           // strip a leading dot
        var tree = query.split('.');
        for (var index = 0, n = tree.length; index < n; ++index) {
            var k = tree[index];
            if (k in object) {
                object = object[k];
            } else {
                return;
            }
        }
        return object;
    }
    
    insertAt(value, index, length, text) {
        return value.substring(0, index) + text + value.substring(index + length);
    }
    
    public abstract handle(node : any) : any;
}

class If implements IExecuteAFunction {
    type : RegExp = /^\:if/gi;
    public handle(node : any) : any {
        var result = {};
        var condition = node["condition"];
        var then = node["then"];
        var otherwise = node["else"];
    }
}

class For extends ReplacingFunction {
    type : RegExp = /^\:for/gi;
    public handle(node : any) : any {
        var result = {};
        var index : number = node["start"];
        var count : number = node["end"] || (node["length"] -1);
        var data : any[] = node["data"];
        var regexThis = /@\(this[\.]?(.*?)\)/gi;
        var regexIndex = /@\(index())/gi;
        
        for(; index <= count; index++) {
            result[`item_${index}`] = JSON.parse(JSON.stringify(node["do"]), (key, text) => {
                if (Object.prototype.toString.call(text) === '[object String]')
                {
                    var match : RegExpExecArray;
                    [regexIndex, regexThis].forEach(regex => {                
                        do {
                            match = regex.exec(text);
                            if (match) {
                                var matchedString = match[1];
                                text = this.insertAt(text, 
                                    match.index, 
                                    match[0].length, 
                                    (!matchedString || 0 === matchedString.length) 
                                        ? data 
                                        : this.resolve(data, matchedString));
                            }
                        } while (match);
                    });
                }
                
                return text;
            });
        }
        
        return result;
    }
}

class ForEach extends ReplacingFunction {
    type : RegExp = /^\:for-each$/gi;    
    
    public handle(node : any) {       
        try {
            var result = {};
            var values : any[] = node["values"];
            values.forEach((value) => {
                var key = Object.prototype.toString.call(value) === '[object String]' ? value : value.key;
                
                result[key] = JSON.parse(JSON.stringify(node), (key, text) => {
                    if (Object.prototype.toString.call(text) === '[object String]')
                    {
                        var regex = /@\(this[\.]?(.*?)\)/gi;
                        var match : RegExpExecArray;
                        do {
                            match = regex.exec(text);
                            if (match) {
                                var matchedString = match[1];
                                text = this.insertAt(text, 
                                    match.index, 
                                    match[0].length, 
                                    (!matchedString || 0 === matchedString.length) ? value : this.resolve(value, matchedString));
                            }
                        } while (match);
                    }
                    
                    return text;
                }).do;
            });
            
            return result;
        }
        catch(err) {
            console.error(err);
            return null;
        }
    }
}

class FunctionFactory {
    functions : IExecuteAFunction[] = [];
        
    public constructor() {
        this.functions.push(new ForEach());
    }
        
    public getHandler(type : any) : IExecuteAFunction {
        return this.functions.filter((item) => item.type.test(type))[0] || 
            null;
    }
}

export class ConfigurationTypeFunctionizer {
    functionFactory : FunctionFactory;
    
    public constructor() { 
        this.functionFactory = new FunctionFactory();
    }
    
    private forEachKeyIn(key, object) : any {
        if (Array.isArray(object)){
            for (var index = 0; index < object.length; index++) {
                object[index] = this.forEachKeyIn(key, object[index]);
            }
            
            return object;
        }
        
        if (object !== Object(object)) return object;
        var handler = this.functionFactory.getHandler(key);
        if (handler) {
            log.verbose.writeln("Functionizer", "Handler found for " + key);
            return handler.handle(object);
        }
        
        var result = {};
        
        Object.keys(object).forEach((key) => {
            result[key] = this.forEachKeyIn(key, object[key]);
        });
        
        return result;
    }
    
    public transform(config) : any {
        Object.keys(config).forEach((key) => {
            config[key] = this.forEachKeyIn(key, config[key]);
        });
        
        return config;
    }
}