REM Assumes server is in parent directory, set to absolute path to run script from anywhere
set SERVER_HOME=..

REM Development is the default environment, showing how to do it explicitly
set NODE_ENV=development

cd %SERVER_HOME%
node app.js
pause