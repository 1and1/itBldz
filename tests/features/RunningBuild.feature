Feature: Running a build
	As a user I want to trigger a build that copies the src files to the target folder
	So I can easily build my project

Background: 
	Given I have a src directory with a file "test.js"
	And I have a target directory
	Given I have an empty build file
		And the build has the build steps "prepare"
			And the build step "prepare" has a task runner that cleans the target folder
		And the build has the build steps "deploy"
			And the build step "deploy" has a task group "files"
				And the task group "files" in the build step "deploy" has a task runner that copies the src directory to the target directory
	And the build file is in the root of my application

Scenario: Trigger a build
	When I execute the build command
	Then all the steps should be executed in the precise order
	And the file "test.js" should exist in folder "target"