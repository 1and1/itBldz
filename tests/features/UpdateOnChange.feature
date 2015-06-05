Feature: Autoupdate on changes
	As a developer when I change a source file, I want a specific set of task 
		to get triggered
	So I can see my changes immediately

Background: 
	Given I have a src directory with a file "myscript.ts"
	And I have an empty build file
		And the build has the build steps "compile"
			And the build step "compile" has a task runner that compiles all TypeScript files
	And the build file is in the root of my application
	And I have a configuration to trigger the build-step "compile" for changes on "**/*.ts"

Scenario: I want to update changes in my typescript files automatically
	Given start the watcher for updating changes
	When I add the character "test" to the file
	Then the javascript file "myscript.js" should be created automatically
	And the javascript file "myscript.js" should contain the characters "test"