@echo off

call:npm %*

call:setup %*

call:prebuild %*

:npm
	@IF "%1"=="setup" (
		npm --prefix .build install 
	) 
goto:eof

:setup
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\.build\.bpm\bpm.js" %*
  @ENDLOCAL
goto:eof

:prebuild
	@IF "%1"=="setup" (
		node  "%~dp0\.build\node_modules\grunt-cli\bin\grunt" --gruntfile="%~dp0\.build\gruntfile.js" prebuild
	) 
goto:eof