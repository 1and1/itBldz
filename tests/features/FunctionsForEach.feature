Feature: Extending a configuration with type discriminators
	As a user I want to be able to use simple functions in my modules
	So I can extend it without creating a grunt-task every time
    
Scenario: Call an foreach loop
	Given I have a src directory with a file "test.js"
	And I have a src directory with a file "another-test.js"
	And I have an empty target directory
    Given I have an empty build file
		And the build has the build steps "deploy"
			And the build step "deploy" has a task group ":for-each"
				And the task group ":for-each" in the build step "deploy" has a task runner that copies the following src files to the target directories: 
                | test.js         |
                | another-test.js |
    And the build file is in the root of my application
    When I execute the build command
    When I execute the build command
    When I execute the build command
	Then the file "test.js" should exist in folder "target"
	Then the file "another-test.js" should exist in folder "target"
