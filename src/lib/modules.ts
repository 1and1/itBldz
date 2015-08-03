import environment = require('./environment');
import logging = require('./logging');
var log = new logging.Log();

export class ModuleService {
    static modules;
    
    public load(modulesDefinition) : any {
        log.verbose.writeln("Config", "modulesDefinition: " + modulesDefinition);
        if (!environment.FileSystem.fileExists(modulesDefinition)) return {};
        
        if (ModuleService.modules) return ModuleService.modules;
        
        var modules : any = {};
        var loadedModules = require(modulesDefinition);
        
        loadedModules.forEach((module) => {
            var requiredModule = require(module);
            log.verbose.writeln("ModuleService", "Loaded " + Object.keys(requiredModule) + " modules from file " + module);
            Object.keys(requiredModule).forEach((exportedClass) => {
                modules[exportedClass] = new (requiredModule[exportedClass])();
            });
        });
        
        log.verbose.writeln("ModuleService", Object.keys(modules).length + " modules loaded");
        log.verbose.writeln("ModuleService", JSON.stringify(modules));
        ModuleService.modules = modules;
        return modules;
    }
}