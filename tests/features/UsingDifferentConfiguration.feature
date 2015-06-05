Feature: Using a different configuration
	As a user I want to trigger a build with custom arguments

Background:
	Given I have a src directory with a file "test.js"
	And I have an empty target directory
	And I have an empty build file
		And the build has the build steps "prepare"
			And the build step "prepare" has a task runner that cleans the target folder
		And the build has the build steps "deploy"
			And the build step "deploy" has a task group "files"
				And the task group "files" in the build step "deploy" has a task runner that copies the src directory to the target directory
	And the build file is in the root of my application with the name "other.json"

Scenario:
	Trigger a custom build
	When I execute a custom build command with argument "--with=other"
	Then all the steps should be executed in the precise order
	And the file "test.js" should exist in folder "target"
