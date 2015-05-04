import fs = require('fs');
import path = require('path');
import sys = require('child_process');

import environment = require('../../../src/lib/environment');

export interface IFileSystem {
    isFileInDirectory(fileName: string, directoryName: string) : boolean;
    withFileInDirectory(fileName: string, directoryName: string, callback: () => void);
    withFileWithContentInDirectory(fileName: string, content: any, directoryName: string, callback: () => void);
    withEmptyDirectory(directoryName: string, callback: () => void);
    getFullDirectory(directoryName: string);
}


class StandardFileSystem implements IFileSystem {
    baseDirectory;

    public constructor() {
        this.baseDirectory = path.join(__dirname, "../testdata");
    }

    create(directory, file = "") : string {
        return path.join(this.baseDirectory, directory, file);
    }

    isFileInDirectory(fileName: string, directoryName: string): boolean {
        return environment.FileSystem.fileExists(this.create(directoryName, fileName));
    }

    withFileInDirectory(fileName: string, directoryName: string, callback: () => void) {
        this.withFileWithContentInDirectory(fileName, "some content", directoryName, callback);
    }

    withFileWithContentInDirectory(fileName: string, content: any, directoryName: string, callback: () => void) {
        fs.mkdir(this.create(directoryName), (err) => {
            fs.writeFile(this.create(directoryName, fileName), content, () => { callback(); });
        });
    }

    withEmptyDirectory(directoryName: string, callback: () => void) {
        try  {
            fs.rmdirSync(this.create(directoryName));            
        } catch (err) {}
        fs.mkdir(this.create(directoryName), (err) => {
            callback();
        });
    }

    getFullDirectory(directoryName: string) {
        return this.create(directoryName);
    }
}

export interface ISystemTerminal {
    output: string;
    execute(command: string, callback : () => void);
}

class StandardSystemTerminal implements ISystemTerminal {
    cwd: string;
    output: string;
    onError: (stderr) => void;
    onOut: (stdout) => void;

    public constructor(cwd: string, onError = (stderr) => {}, onOut = (stdout) => {}) {
        this.cwd = cwd;
        this.onError = onError;
        this.onOut = onOut;
    }

    execute(command: string, callback: () => void) {
        this.output = "";
        command = path.join(this.cwd, command);
        sys.exec(command, { cwd: this.cwd }, (error, stdout, stderr) => {
            if (stderr) this.onError(stderr);
            this.onOut(stdout);
            this.output = stdout.toString();
            callback();
        });
    }
}

export class World {
    fileSystem: IFileSystem;
    terminal: ISystemTerminal;
    
    public constructor(callback) {
        this.fileSystem = new StandardFileSystem();
        this.terminal = new StandardSystemTerminal(this.fileSystem.getFullDirectory("."),
            (stderr) => {
                console.error(stderr);
            },
            (stdout) => {
                console.log(stdout);
            });
        callback();
    }
}