var known = { help: Boolean, version: Boolean, completion: String };
var aliases = { h: '--help', V: '--version', v: '--verbose' };

var args = require('nopt')(known, aliases, process.argv, 2);

var chalk = require('chalk');

export interface ILogger {
    error(src: string, value: string);
    writeln(src: string, value: string);
}

class Helper {
    static missing(length, current: string) {
        length = length - current.length;
        if (length < 1) return "";
        return Array(length).join(" ");
    }

    public static type(type: string) {
        return "[" + chalk.blue(type) + Helper.missing(10, type) + "] ";
    }

    public static error(error: string) {
        return "[" + chalk.red(error) + Helper.missing(10, error) + "] ";
    }

    public static src(src: string) {
        return chalk.green(src) + Helper.missing(15, src) + " > ";
    }
}

class SilentLogger implements ILogger {
    public error(src: string, value: string) {
    }

    public writeln(src: string, value: string) {
    }
}

class ConsoleLogger implements ILogger {
    private type;
    public constructor(type) {
        this.type = type;
    }

    public error(src, value) {
        console.error(Helper.error("Error") + Helper.src(src) + value);
    }

    public writeln(src, value: string) {
        console.log(Helper.type(this.type) + Helper.src(src) + value);
    }
}

export class Log {
    private innerLogger: ILogger;
    verbose: ILogger;

    public constructor() {
        this.innerLogger = new ConsoleLogger("Log");
        this.verbose = args["verbose"] ? new ConsoleLogger("Verbose") : new SilentLogger();
    }

    public error(src, value: string) {
        this.innerLogger.error(src, value);
    }

    public writeln(src, value: string) {
        this.innerLogger.writeln(src, value);
    }
}