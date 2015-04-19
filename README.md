# itBldz Build-Tools

__The only build-tool you'll ever need__

The goal is to provide an easy to setup framework which allow every development team a "closed for modification, open for extension"-plattform for their own needs.

__Breaking Changes to v1__

* bpm was dropped. itbldz now setup itself
* Custom config files no longer supported
* custom tasks can no longer be added. all the tasks exist purely in memory, so every task that runs must be npm

## Usage

### Setup

create your config

```shell
echo '{ "say-hi" : { "helloworld" : { "task" : "helloworld", "package" : "grunt-helloworld", "dummytarget": {} } } }' > build.json
echo '{ "deploy" : { "copy" : { "task" : "copy", "package" : "grunt-contrib-copy", "files": { "src" : "**/*", "dest" : "../target" } } } }' > deploy.json
echo '{ }' > config.json
```

Install itBldz

```shell
npm install itbldz --save-dev
```

build

```shell
./node_modules/itbldz/build
```

deploy

```shell
./node_modules/itbldz/deploy
```

or ship it (build & deploy)

```shell
./node_modules/itbldz/ship
```

in the shell / commandline

### Options

All your arguments will be passed to grunt. To trigger tasks, simply add them.

Examples:

Get all tasks with description
> ./node_modules/itbldz/build --help

Verbose output:
> ./node_modules/itbldz/build --verbose

Given this config: 
````
{
    "compile": { /* compile your sources */ },
	"build": {
		"unit" : { /* unit tests */ },
		"acceptance" : { /* acceptance tests */ }
	}
}
````

Compile your source:
> ./node_modules/itbldz/build compile

Compile and trigger your unit tests:
> ./node_modules/itbldz/build compile test/unit


### Configure for your use case

To include this project, all you have to do is to configure the build.json and
the config.json.

#### build.json

**What to do**

The build.json is the task-template. It orchestrates the build, and is separated
into build-steps, task-groups and tasks.

##### build-steps
The build-step is the first layer. It defines the main tasks of the build. You
should use a natural language that fits your build-pipeline best.

##### Task Groups
Task-groups are containers for other task-groups and tasks. They do not run
by itself, but rather orchestrate the task-groups and tasks they contain.
They are used to organize build-steps, and should use a natural language that
describe their use best.

##### Tasks Runners
Task Runners are the hard and soul, and are executors for grunt-tasks. They can
have arbitrary names and should describe best what they do, not what grunt task
they are using.
Which grunt-task they run is specified by the properties _task_ and _package_.
The _task_ field specifies the name of the grunt-task that should be run, while
the _package_ field specifies which npm package is required to run the task.
**Note**: itBldz will install all required packages automatically. There is no
action required on your side.

The build.json is to be the same on every environment you run the build.

An example: 
````json
{
    "test": {
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

## Contributing

### Guidelines

You are free to extend the project as you wish. Every new code has to include
unit tests and result in a green build when building the build-tools executing

```shell
./node_modules/itbldz/build
```
