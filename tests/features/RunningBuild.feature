Feature: Running a build
	As a user I want to trigger a build that copies the src files to the target folder
	So I can easily build my project

Background: 
	Given I have a src directory with a file "test.js"
	And I have a target directory
	Given I have the build file
		And the build has the build steps "prepare"
			And the build step "prepare" has a task runner that cleans the target folder
		And the build has the build steps "copy"
			And the build step "step" has a task group "group"
				And a task group "group" has a task runner that copies the src directory to the target directory

Scenario: Trigger a build
	When I execute the build command
	Then all the steps should be executed in the precise order
	And the file "test.js" should exist in folder "target"