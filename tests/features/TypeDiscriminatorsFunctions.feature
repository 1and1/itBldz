Feature: Extending a configuration with type discriminators
	As a user I want to be able to use simple functions in my modules
	So I can extend it without creating a grunt-task every time

Scenario: Call a function from a grunt task
	Given I have a src directory with a file "test.js"
	And I have an empty target directory
    Given I have a file "function.js" with the following content
    """
function rename(dest, src) {
    return dest + "/result.txt";
}
exports.rename = rename;
    """
    Given I have an empty build file
		And the build has the build steps "deploy"
			And the build step "deploy" has a task group "files"
				And the task group "files" in the build step "deploy" has a task runner that copies the src directory to the target directory and calls the function "rename" from script "function.js"
    And the build file is in the root of my application
    When I execute a custom build command with argument "--verbose"
    When I execute a custom build command with argument "--verbose"
    Then the file "result.txt" should exist in folder "target"
    