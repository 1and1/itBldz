@echo off
@SETLOCAL
@SET PATHEXT=%PATHEXT:;.JS;=;%
node  "%~dp0\.build\node_modules\grunt-cli\bin\grunt" --gruntfile="%~dp0\.build\gruntfile.js" %*
@ENDLOCAL