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
"{ "say-hi" : { "helloworld" : { "task" : "helloworld", "package" : "helloworld" } } }" > build.json
"{ }" > config.json
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

### Configure for your use case

To include this project, all you have to do is to configure the build.json and the config.json.

#### build.json

The build.json is the task-template. It orchestrates the build, and has four main tasks with the following subtasks:

```
* prepare           - prepares the build-environment
    * clean         - cleans a folder (default: grunt-contrib-clean)
    * mkdir         - creates a new directory (default: grunt-mkdir)
* validate          - validates the source for syntax, sematics and style conformance
    * syntax        - syntax check of the language
        * js        - (default: grunt-jsvalidate)
    * semantic      - semantic check of the language
        * js        - (default: grunt-contrib-jshint)
* test              - runs unit and quality (i.e. coverage) tests
    * unit
        * js        -  runs unittests against js
    * coverage
        * js        - runs unittests and checks the unit test code coverage for js
* create-deployable - creates a deployable for the code (i.e. minification, uglification...)
    * copy          - copies files
```

The build.json has to be the same on every environment you run the build.

```json
    {
      "prepare": { },
      "validate": {
        "syntax": {
          "js" : {}
          /* ... */
        },
        "sematic": {
          "js" : {}
          /* ... */
        }
      },
      "test": {
        "coverage" : {
          "js" : {}
          /* ... */
        },
        "quality" : {}
      },
      "create-deployable": { }
    }

```

#### Tasks

For  each step add the task name and package as follows:

```json
{
  "prepare": { },
  "validate": {
    "syntax": {
      "js" : {
        "task"    : "jshint",
        "package" : "grunt-contrib-jshint"
      }
    }
  }
}

```

Options can be added to the js - step accordingly.

#### config.json

The config.json is describing the environment the build is running in. It is used to control the directories, file-patterns, or environmental specifics.
You can use all variables in the config.json in your build.json by typing

> &lt;%= config.YOURKEY %&gt;

```json
    {
      "directories" : {
        "sources" : "sources",
        "output" : "target"
      },
      "filesets" : {
        "php" : ["**/*.php", "!**/framework/**"]
      }
      /* ... */
    }

```

#### Create your configured build
Once your done configuring the build, call

> bpm setup

on the folder and the build will be created automatically.

If you want to add an additional module not in the configuration (which you don't) you can call

> bpm add --m buildstep/module --t Taskname --p some-grunt-package

And the module will be added automatically to the buildstep.

## Deving

### Guidelines

You are free to extend the project as you wish. Every new code has to include
unit tests and result in a green build when building the build-tools using the
default build.json & config.json

### Working with the task engine

The build-tools are using a simple task engine which allow for task aliasing and
automatic dependency resolving in npm.
Using the task engine you can easily (and with almost no code) extend the core
of the build-tools.

All you have to do is follow some conventions.

A build config step should look like the following to get you started:

```json
{
  "build-step" : {
    "task" : {
      "language-or-options" : { },
      "other-language-or-more-options" : { }
    }
  }  
}
```

Now to setup your build-step, add a folder "build-step" to your .build folder,
add a build-step.js to the folder, and add a task-folder to the "build-step"
folder, again with a task.js file.
Your directory might now look something like this:

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

open the build-step.js file and open the following ceremony code:

```js
var conf = requireRoot('conf'), path = require("path");
var taskengine = requireRoot('taskengine');

module.exports = function (grunt) {
  var taskContext = taskengine.startup({
    "grunt" : grunt,
    "buildStep" : path.basename(__filename, ".js"),
    "path" : __dirname
  });

  taskengine.run(taskContext, 'Run my custom buildstep.');
};
```

Next open the task.js. In order for it to do anything, we will use it to clean
a directory.
Add the following ceremony maccaroni:

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

The parent is our build-step defined above, our default task is clean using the
grunt-contrib-clean package.

Now to register the build-step, open the build.json and paste the following:

```json
{
  "build-step" : {
    "task" : {
      "options": { "force": true },
      "target": [ "." ]
    }
  }  
}
```

Open the console and type

> build

Congratulations! You have just created a self deleting build.
All your just written files where deleted automatically! Brave new world :)

#### Running tasks for multiple languages

Consider you want your task.js to trigger different tasks for different
languages.
Start of by modifying your config to look like the following:

```json
{
  "build-step" : {
    "task" : {
      "js" : {
        "options": { "force": true },
        "target": [ "js" ]
      },
      "css" : {
        "options": { "force": true },
        "target": [ "css" ]
      }
    }
  }  
}
```

and in your task.js file change the options to an array with the two values
"task->js" and "task->css" and add an additional line where you call the
"loadTaskDirectories" function of the taskengine.

```js
var conf = requireRoot('conf');

var taskengine = requireRoot('lib/taskengine/te');

module.exports = function (grunt) {
  taskengine = taskengine({
    "parent" : "build-step",
    "options" : {
      "task" : ["task->js", "task->css"],
      "package" : "grunt-contrib-clean"
    }
  });

  taskengine.loadTaskDirectories(grunt, __dirname, "build-step/task");
  taskengine.runSubtask("clean",
    "Cleaning everything from a directory",
    grunt,
    grunt.config("build")["build-step"].task);
};
```

Add two folders "js" and "css" to the directory, and place two files inside. The
files now act as leafed subtask and look like task.js did before. For instance,
the file in the js folder would look like this:

```js
var te = requireRoot('lib/taskengine/te');

module.exports = function (grunt) {
  te = new te({
    "parent" : "task",
    "options" : {
      "task" : "clean"
    }
  });

  te.runSubtask("js", "Cleaning up the js files",
    grunt,
    grunt.config("build")["build-step"].task.js);
};

```

You can add as much layers as you like.
