Feature: Extending a configuration with type discriminators
	As a user I want to be able to use simple functions in my modules
	So I can extend it without creating a grunt-task every time
    
Scenario: Typediscriminator for module
	Given I have an empty modules file
		And the module HelloWorld is defined and exists
	And the modules file is in the root of my application
	Given I have an empty build file
		And the build has the build steps "echo"
			And the build step echo has a exec task runner with a type discriminator for the HelloWorld Module with "Bruce Lee" as actor
	And the build file is in the root of my application
	When I execute the build command
	Then the message "Hello Bruce Lee" should appear on the command line