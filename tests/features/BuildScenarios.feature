Feature: Running a build
	As a user I want to trigger a build for a specific scenario
	So I can define subsets of the build for different use cases

Background: 
	Given I have a src directory with a file "test.js"
	And I have an empty target directory
	And I have an empty build file
		And the build has the build steps "prepare"
			And the build step "prepare" has a task runner that cleans the target folder
		And the build has the build steps "deploy"
			And the build step "deploy" has a task group "files"
				And the task group "files" in the build step "deploy" has a task runner that copies the src directory to the target directory
	And the build file is in the root of my application
	Given I have a build scenario file "clean"
		And the scenario "clean" executes the step "prepare"
	And the scenario file "clean" is in the root of my application

Scenario: 
	Trigger a build
	When I execute a custom build command with argument "--scenario=clean"
	Then the step "prepare/clean" should have been executed
	And the step "deploy/files/copy" should not have been executed