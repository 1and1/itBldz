var fs = require('fs');

export class Variables {
    public get() {
        var self = {};

        Object.keys(process.env).forEach(function (key) {
            self[key] = process.env[key];
        });

        return self;
    }
}

export enum ActionType {
    Build,
    Deploy,
    Ship,
    Init
}

export class FileSystem {
    public static fileExists(filePath) {
        try {
            console.log("Checking if file exists: " + filePath + " among the following files:");
            fs.readdirSync(filePath).forEach((file) => {
                console.log("\t" + file);
            });
            fs.statSync(filePath);
        } catch (err) {
            if (err.code == 'ENOENT') return false;
        }
        return true;
    }
}

export class Action {    
    public static get(): ActionType {
        var _ = require('yargs').argv._;
        if (_.some((_) => _ == "build")) {
            return ActionType.Build;
        }
        else if (_.some((_) => _ == "deploy")) {
            return ActionType.Deploy;
        }
        else if (_.some((_) => _ == "ship")) {
            return ActionType.Ship;
        }
        else if (_.some((_) => _ == "init")) {
            return ActionType.Init;
        }
    }
}