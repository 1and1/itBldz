@pushd ".build"

call:npm %*

call:setup %*

call:prebuild %*

:npm
	@IF "%1"=="setup" (
		npm install
	) 
@goto:eof

:setup
  @echo "calling node"
@IF EXIST "%~dp0\node.exe" (
  @echo "calling node"
  "%~dp0\node.exe"  "%~dp0\.build\.bpm\bpm.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  @echo "calling node"
  node  "%~dp0\.build\.bpm\bpm.js" %*
  @ENDLOCAL
)
@goto:eof

:prebuild
	@IF "%1"=="setup" (
		node  "%~dp0\.build\node_modules\grunt-cli\bin\grunt" --config="%~dp0\config.json" prebuild
	) 
@goto:eof

@popd