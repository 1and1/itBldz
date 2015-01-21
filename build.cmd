@pushd ".build"

@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\.build\node_modules\grunt-cli\bin\grunt" --config="%~dp0\config.json" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\.build\node_modules\grunt-cli\bin\grunt" --config="%~dp0\config.json" %*
  @ENDLOCAL
)

@popd
