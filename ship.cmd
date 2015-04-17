@echo off
@SETLOCAL
@SET PATHEXT=%PATHEXT:;.JS;=;%
node %~dp0\itbldz.js deploy %*
@ENDLOCAL