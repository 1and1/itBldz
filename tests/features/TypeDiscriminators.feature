Feature: Extending a configuration with modules
	As a user I want to be able to use simple functions in my modules
	So I can extend it without creating a grunt-task every time

Background:
	Given I have an empty modules file
		And the module HelloWorld is defined and exists   
	And the modules file is in the root of my application
	Given I have an empty build file
		And the build has the build steps "echo"
			And the build step "echo" has a exec task runner with a type discriminator for the HelloWorld Module
	And the build file is in the root of my application

Scenario: 
	Trigger a build
	When I execute the build command
	Then the message "Hello me" should appear on the command line