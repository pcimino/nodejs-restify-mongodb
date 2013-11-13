REM Assumes server is in parent directory, set to absolute path to run script from anywhere
set SERVER_HOME=..

cd %SERVER_HOME%
call npm install -g serialport 
call npm install -g node-gyp 
call npm install 