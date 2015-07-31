Feature: Extending a configuration with variables
    As a user I want to be able to use variables from a defined yml file

Background:
    Given I have an empty vars file
        And the variable "world" exists under "hello"
    And the vars file is in the root of my application
    Given I have an empty build file
        And the build has the build steps "echo"
            And the build step "echo" has a exec task runner with the command "echo '<%= vars.hello.world %>'"
    And the build file is in the root of my application

Scenario: 
    Trigger a build
    When I execute a custom build command with argument "--verbose"
    Then the message "Hello world" should appear on the command line