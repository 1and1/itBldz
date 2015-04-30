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

    withFileInDirectory(fileName: string, directoryName: string, callback: (err) => void) {
        this.withFileWithContentInDirectory(fileName, "", directoryName, callback);
    }

    withFileWithContentInDirectory(fileName: string, content: any, directoryName: string, callback: (err) => void) {
        fs.mkdir(this.create(directoryName), (err) => {
            fs.writeFile(this.create(directoryName, fileName), content, callback);
        });
    }

    withEmptyDirectory(directoryName: string, callback: () => void) {
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

    public constructor(cwd: string) {
        this.cwd = cwd;
    }

    execute(command: string, callback: () => void) {
        this.output = "";

        sys.exec(command, { cwd: this.cwd }, (error, stdout, stderr) => {
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
        this.terminal = new StandardSystemTerminal(this.fileSystem.getFullDirectory("."));
        callback();
    }
}