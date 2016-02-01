# itBldz Build-Tools

[![travisci-build](https://api.travis-ci.org/1and1/itBldz.svg?branch=master)](https://travis-ci.org/1and1/itBldz)
[![david-dm](https://david-dm.org/1and1/itBldz.svg)](https://david-dm.org/1and1/itBldz)
[![NPM](https://nodei.co/npm/itbldz.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/itbldz/)

__The only build-tool you'll ever need__

The goal is to provide an easy to setup framework which allow every development team a "closed for modification, open for extension"-plattform for their own needs.

## Principles

1. The build and deployment pipelines are to be explicit, repeatable, and tested.
2. It must be easy to understand what happens when.
3. A build/deployment-definition is configuration

## Usage

### Setup

Install itBldz

```shell
npm install -g itbldz --save-dev
```

and create your config with

```shell
init-itbldz
```

if something is missing edit the config files that are created (config.json, build.json, deploy.json).

build it

```shell
build-it
```

deploy it

```shell
deploy-it
```

or ship it (build & deploy)

```shell
ship-it
```

_Note:_ If you don't install it globally, you can use
```shell
[node] ./node_modules/itbldz/bin/build-it.js|deploy-it.js|ship-it.js|init-itbldz.js
```

### Options

All your arguments will be passed to grunt. To trigger tasks, simply add them.

Examples:

Get all tasks with description

```shell
build-it --help
```

Verbose output:
```shell
build-it --verbose
```

Given this config:
````
{
    "compile": {
        "typescript : { /* compile your sources */ }
    },
	"build": {
		"unit" : { /* unit tests */ },
		"acceptance" : { /* acceptance tests */ }
	}
}
````

Compile your source:
```shell
build-it compile/typescript
```

Compile and trigger your unit tests:
```shell
build-it compile/typescript test/unit
```

Build it using another config "uglify.json"
```shell
build-it --with=uglify
```

Deploy using another config "heroku.json"
```shell
deploy-it --to=heroku
```

Change the configuration to point to the production.json file
```shell
deploy-it --to=heroku --as=production
```

Ship it with "uglify.json" and "heroku.json"
```shell
ship-it --with=uglify --to=heroku
```

### Configure for your use case

To include this project, all you have to do is to configure the build.json and
the config.json.

#### build.json

The build.json is the task-template. It orchestrates the build, and is separated
into build-steps, task-groups and tasks.

##### build-steps
The build-step is the first layer. It defines the main tasks of the build. You
should use a natural language that fits your build-pipeline best.


An example:
````json
    {
        "prepare build environment" : {},
        "compile" : {},
        "tests" : {}
    }
````

##### Task Groups
Task-groups are containers for other task-groups and tasks. They do not run
by itself, but rather orchestrate the task-groups and tasks they contain.
They are used to organize build-steps, and should use a natural language that
describe their use best.

An example:
````json
    {
        "compile" : {
            "code" : {
                "java using maven" : {},
                "typescript to javascript" : {}
            },
            "assets" : {
                "less to css" : {}
            }
        },
        "tests" : {}
    }
````

##### Tasks Runners
Task Runners are the heart and soul, and are executors for grunt-tasks. They can
have arbitrary names and should describe best what they do, not what grunt task
they are using.
Which grunt-task they run is specified by the properties _task_ and _package_.
The _task_ field specifies the name of the grunt-task that should be run, while
the _package_ field specifies which npm package is required to run the task.
**Note**: itBldz will try to install all required packages automatically. However,
at the current moment for global installation of itblz that's only true for references
you do not require('') in your application. These you will have to add to your
package.json.

The build.json is to be the same on every environment you run the build.

An example:
````json
{
    "tests": {
        "unit": {
            "task": "mochaTest",
            "package": "grunt-mocha-test",
            "dependencies": [ "chai", "sinon" ],
            "test": {
                "src": [ "<%= config.files.unit %>" ],
                "quiet": "true"
            }
        }
    }
}

````

This runs mocha unit tests
* _"task"_: the task name that should be executed
* _"package"_: the npm package that contains the task. The reference a specific version, add "@1.0.0" to the package name (replace 1.0.0 with the version you want...)
* _"dependencies"_ (optional): The dependencies the Task Runner may need

#### config.json

**Where to do it**

The config.json is describing the environment the build is running in. It is
used to control the directories, file-patterns, or environmental specifics.
You can use all variables in the config.json in your build.json by typing

> &lt;%= config.YOURKEY %&gt;

An example would be:

```json
    {
      "directories" : {
        "sources" : "sources",
        "output" : "target"
      },
      "filesets" : {
        "php" : ["**/*.php", "!**/framework/**"]
      }
    }

```
Make sure the configuration natively reflects the language on how you are
talking about your environment.

For different environments you might have different configurations. Split them
and reference the correct config when starting the build.

#### watch.json

The watch.json helps you in describing what tasks you want to run automatically. It consists of generic blocks (i.e. "compile", "test") that describe what you are doing  

Given you have a build.json with a compile typescript task:

````json
{
    /* other stuff */
    "compile": {
        "typescript": {
            "task": "ts",
            "package": "grunt-ts",
            "default": {
                "options": {
                    "module": "commonjs",
                    "compile": true
                },
                "src": "<%= config.sources.TypeScript.files %>"
            }
        }
    }    
    /* other stuff */
}
````

Now you don't want to trigger the full build everytime, but rather every time a file changes. Then you would have a watch.json that would look like the following:

````json
{
      "compile": {
            "files": ["**/*.ts"],
            "tasks": ["compile/typescript"],
            "options": {
                  "perFile": {
                        "targets" : ["default"]
                  }
            }
      }
}
````

In the "tasks" you can reference the build-tasks that should run, the "options" are the options that will be provided to the grunt-contrib-watch library.   

#### Environment

In your configuration and build you can access the environment variables of your host system as well.

Add the Statement

> &lt;%= env.ENV_VARIABLE %&gt;

and it will automatically be replaced.

#### Variables

Apart of the config and the environment, you can add an additional yaml file. The default name for the files is "vars.yml".

Now you can add the Statement

> &lt;%= vars.your.variable %&gt;

and it will automatically be replaced.

## Build Scenarios

As your build grows, different scenarios might be required for your build to run in. Typical scenarios are "development" and "continuous integration build". While the latter might be your full build, for the first you might only a subset to be run every time you trigger the build.

To enable this behavior you can create specific scenario files to target only a subset of the tasks in your build.json. These files are yaml files with the following syntax:

````yml
steps:
- "test/typescript/acceptance/clean-test-results"
- "test/typescript/acceptance/scenarios"
````

This scenario executes only the two specified build steps, and only if they are defined in your build definition.
Given this file is called "test.yml" you can now call it using:

````shell
build-it --scenario=test
````

## I need a function in my configuration!

Sorry, but that sounds like an oxymoron.
itbldz is to **configure build scenarios** in an easy way, and adding logic to your configuration does not seem to help reducing complexity.

If you want a grunt task to do more then what is configured, then create an npm package, test it and use this.

However, now that you know that you shouldn't do it, here's the way on how to do it. In the template syntax you can execute functions as well:

````json
    {
        "example-timestamp": "<%= Date.now() %>'"
    }
````

This can be extended - you can create simple Modules that look like the following (TypeScript):

````ts
    export class HelloWorld {
    	public greet(name) {
    		return "Hello " + name;
    	}
    }
````

Then in your configuration (i.e. build.json) you can include the module like this:

````json
    {
        "test-module": {
            "hello world" : {
                "task": "exec",
                "package": "grunt-exec",
                "echo-module" : {
                    "cmd" : "echo '<%= modules.HelloWorld.greet('me') %>'"
                }
            }
        }
    }
````

To control the modules that should be loaded, a module.js file is added that is automatically included if available or can be included with --modules=path/to/modules.js which looks like the following:

````json
    [
    	"modules/HelloWorld.js"
    ]
````

The name of the module is the name of the class in the file that should be loaded for this keyword, so that when you have multiple classes like so:

````ts
    export class HelloWorld {
    	public greet(name) {
    		return "Hello " + name;
    	}
    }
    export class GoodbyeWorld {
    	public greet(name) {
    		return "Goodbye " + name;
    	}
    }
````
you will have both available in the configuration.

## Type Discriminators

JSON-Files do not support objects, but JavaScript (and Grunt) does. For instance, some tasks require Regular Expressions. This can be implemented by using Type-Discriminators in your configuration. The Syntax is the following:

### Regex

````json
    {
        "myKey" : {
            ":type" : { 
                "type":"RegExp",
                "object": { "pattern" : ".*?", "flags" : "gmi" }
            }
        }
    }
````

will become:

````js
    {
        "myKey" : /.*?/gmi
    }
````

### Functions

If you need a plain javascript function, you can add it by placing it in a .js file in your base dir. 
So given you need to use the replace function for the file syntax in a config that looks like this:   

````json
    {
        "files" : [{
            "expand":true,
            "flatten":true,
            src":["src/*.js"],
            "dest":"target/",
            "rename": {
                ":type" : {
                    "type":"Function",
                    "object":{"src":"function.js"},
                    "call":"rename"
                }
            }
        }]
    }
````

Then you can create a file function.js, and place it in your basedir:

````js
    function rename(dest, src) {
        return dest + "/somestuff/" + new Date() + require('path').extname(src);
    }
    exports.rename = rename;
````

If you call build-it now, during runtime the configuration will look like the following: 

````json
    {
        "files" : [{
            "expand":true,
            "flatten":true,
            src":["src/*.js"],
            "dest":"target/",
            "rename": function(dest, src) {
                return dest + "/somestuff/" + new Date() + require('path').extname(src);
            }
        }]
    }
````

### Modules

This can be used with Modules as well. Given you have a module

````ts
    export class HelloWorld {
        defaultPersonToGreet:string;
    	public greet(name) {
    		return "Hello " + (name || this.defaultPersonToGreet);
    	}
    }
````

and a configuration

````json
{
    "myKey" : {
        ":type": {
            "type" : "modules.HelloWorld",
            "object" : { "defaultPersonToGreet" : "Bruce Lee"  },
            "call" : "greet"
        }
    }
}
````

will then become:

````js
{
    "myKey" : function(){ return modules.HelloWorld.greet.apply(deserializedModule, arguments); }
}
````

Types available for deserialization are:

* RegExp
* Modules
* Functions

## Experimental Features

**The following features are experimental, unstable, and might change or be removed in future versions**

### run-it

In a typical development workflow, you don't want to compile typescript files or run your tests everytime you make a change, but rather have that done automatically for you. This can be done using the *run-it* workflow. 

To make this work you will have to create a run configuration. The default filename is *run.json*, and it would look like the following: 

````json
{
      "scripts": {
            "files": ["<%= config.sources.TypeScript.files %>"],
            "tasks": ["compile/typescript"],
            "options": {
                  "spawn" : false,
                  "perFile": {
                        "targets" : ["default"]
                  }
            }
      }
}
````

The "compile/typescript" task has to be defined in your build.json.
The rest is the same as in a grunt file for the watch without the outer watch:

````js
watch: {
  scripts: {
    files: ['**/*.ts'],
    tasks: ['ts'],
    options: {
      spawn: false,
      perFile : { targets: ["default"] }
    },
  },
}
````

By calling 
````shell
run-it
````

the watcher starts. Changing a typescriptfile will trigger the task and recompile your TypeScript files

## Contributing

### Getting started

Git clone this repository, run a

````
npm install -g itbldz
npm install
tsd reinstall
````

and then

````
build-it
````

to have it set up

### Guidelines

You are free to extend the project as you wish. Every new code has to include
unit tests and result in a green build when building the build-tools executing

```shell
build-it
```
