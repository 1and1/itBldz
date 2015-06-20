# itBldz Build-Tools

[![travisci-build](https://api.travis-ci.org/1and1/itBldz.svg?branch=master)](https://travis-ci.org/1and1/itBldz)
[![david-dm](https://david-dm.org/1and1/itBldz.svg)](https://david-dm.org/1and1/itBldz)
[![NPM](https://nodei.co/npm/itbldz.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/itbldz/)

__The only build-tool you'll ever need__

The goal is to provide an easy to setup framework which allow every development team a "closed for modification, open for extension"-plattform for their own needs.

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
* _"package"_: the npm package that contains the task
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

#### Environment

In your configuration and build you can access the environment variables of your host system as well.

Add the Statement

> &lt;%= env.ENV_VARIABLE %&gt;

and it will automatically be replaced.

## I need a function in my configuration!

Sorry, but that sounds like an oxymoron. 
itbldz is to **configure build scenarios** in an easy way, and adding logic to your configuration does not seem to help reducing complexity.

If you want a grunt task to do more then what is configured, then create an npm package, test it and use this.

If you need a task-runner where you can add functions to your configuration, then directly use grunt. 

## Contributing

### Getting started

Git clone this repository, run a

````
npm install -g itbldz
npm install
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
