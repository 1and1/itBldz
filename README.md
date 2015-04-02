# itBldz Build-Tools

__The only build-tool you'll ever need__

The goal is to provide an easy to setup framework which allow every development team a "closed for modification, open for extension"-plattform for their own needs.

## Usage

### Setup

Install itBldz

```shell
npm install itbldz
```

create your config

```shell
echo '{ "say-hi" : { "helloworld" : { "task" : "helloworld", "package" : "grunt-helloworld", "dummytarget": {} } } }' > build.json
echo '{ }' > config.json
```

setup the build with your config

```shell
./node_modules/itbldz/bpm setup
```

execute

```shell
./node_modules/itbldz/build
```

in the shell / commandline

### Options

All your arguments will be passed to grunt.

Examples:

Verbose output:
> build --verbose

Run only tests
> build test

Run only tests but verbose
> build test --verbose

Get all tasks with description
> build --help

Get configs for a specific target (see )

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
Typical steps would be:
* _prepare_ - prepares the build-environment
* _validate_ - validates the source for syntax, sematics and style conformance
* _compile_ - compiles the source code
* _test_ - runs unit and quality (i.e. coverage) tests
* _create-deployable_ - creates a deployable package for your code
* _publish_ - publishes your deployable package to your environment

##### task-groups
Task-groups are containers for other task-groups and tasks. They do not run
by itself, but rather orchestrate the task-groups and tasks they contain.
They are used to organize build-steps, and should use a natural language that
describe their use best.
An example would be:
* validate
 * _syntax_ - syntax check of the language
 * _semantic_ - semantic check of the language

##### tasks
Tasks are the hard and soul, and are basically runners for grunt-tasks. They can
have arbitrary names and should describe best what they do, not what grunt task
they are using.
Which grunt-task they run is specified by the properties _task_ and _package_.
The _task_ field specifies the name of the grunt-task that should be run, while
the _package_ field specifies which npm package is required to run the task.
**Note**: itBldz will install all required packages automatically. There is no
action required on your side.
An example for tasks would be:  
* validate
 * syntax
   * _js_[task=jshint;package=grunt-contrib-jshint]  
   * _php_[task=phplint;package=grunt-phplint]  

The build.json is to be the same on every environment you run the build.

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

#### Create your configured build
Once your done configuring the build, call

```shell
./node_modules/itbldz/bpm setup
```

on the folder and the build will be created automatically.

If you want to add an additional module not in the configuration (which you
don't want to do, you really want it all the configuration and not call manually,
but it's always nice to know you could) you can call

```shell
./node_modules/itbldz/bpm add --m buildstep/module --t Taskname --p some-grunt-package
```
And the module will be added automatically to the buildstep. Note that this will
not actually run the module as long as it is not configured in the build.json

#### Seperate your Concerns

Not everything has to be in one file. For instance, when your developers commit their code to a remote git repo, while the CI System deploys using ssh, you might want to separate the deployment from the build.

Create a new file __deploy.json__, and configure it using

```shell
./node_modules/itbldz/bpm setup --config=deploy.json
```

Then run the deployment with

```shell
./node_modules/itbldz/build --build=deploy.json
```

#### Adjust build for different environments
Occasionally your environments are not the same from dev to live, and you want
to adjust stuff. Most probably sensitive information you don't want to share
on github.com.

To achieve this, you can overwrite parts of the configuration (or the complete
configuration) with target-files in the format "config.[target].json" by
passing the following arguments to itbldz:

* _target_ : string - The target to address
* _target-path_ : string - The path to the target files. Defaults to current path
* _target-overwrite_ (short: o) : boolean - If true, the leaf will be replaced by the target
    (default false)

Example:

```json
{
    "other" : {},
    "database": {
        "server": "localhost",
        "port": "123"
    },
    "stuff" : {}
}
```
_config.json_

```json
{
    "database": {
        "server": "dbserver.corp.contoso.com",
        "port": "1433",
        "user" : "web",
        "password" : "<%= env.PASSWORD %>"
    }
}
```
_config.live.json_

when calling

```shell
./node_modules/itbldz/build --target=live
```

The resulting config will look like:
```json
{
    "other" : {},
    "database": {
        "server": "dbserver.corp.contoso.com",
        "port": "1433",
        "user" : "web",
        "password" : "<%= env.PASSWORD %>"
    },
    "stuff" : {}
}
```

**NOTE:** You can only override defined steps in the master, you cannot add additional steps. Why? Because your deployment should be the same over all environments.

__But my deployment to dev & live is very VERY differnet!__ Then you will have to add both to the master, and then override and thus deleting it for every environment.

## Deving

### Guidelines

You are free to extend the project as you wish. Every new code has to include
unit tests and result in a green build when building the build-tools executing

```shell
./node_modules/itbldz/build
```

### Working with the task engine

The build-tools are using a simple task engine which allow for task aliasing and
automatic dependency resolving in npm.
Using the task engine you can easily extend the core of the build-tools. The bpm
tools are following the conventions by the task engine to prepare the build.

A build config step should look like the following to get you started:

```json
{
  "build-step" : {
    "task" : {
      "task" : "clean",
      "package" : "grunt-contrib-clean",
      "options": { "force": true },
      "target": [ "." ]
    }
  }  
}
```

When confronted with such a build-step, the folder structure expected by the
task engine is:

```
  build-tools
  |_ .build
    |_ build-step
      |_ task
        task.js
      build-step.js
    gruntfile.js
  build.json
  config.json
```

When opening the build-step.js file you see the following code:

```js
var conf = requireRoot('conf'), path = require("path");
var taskengine = requireRoot('taskengine');

module.exports = function (grunt) {
  var taskContext = taskengine.startup({
    "grunt" : grunt,
    "buildStep" : path.basename(__filename, ".js"),
    "path" : __dirname
  });

  taskengine.run(taskContext);
};
```

The build-step simply starts up the taskengine and registers itself. Then
running the taskengine.

Next open the task.js.

```js
var conf = requireRoot('conf');

var taskengine = requireRoot('lib/taskengine/te');

module.exports = function (grunt) {
  taskengine = taskengine({
    "parent" : "build-step",
    "options" : {
      "task" : "clean",
      "package" : "grunt-contrib-clean"
    }
  });

  taskengine.runSubtask("clean",
    "Cleaning everything from a directory",
    grunt,
    grunt.config("build")["build-step"].task);
};
```

The task itself is registering itself, referencing the parent build-step, and
then running the subtask.
