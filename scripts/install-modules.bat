REM Assumes server is in parent directory, set to absolute path to run script from anywhere
set SERVER_HOME=..

cd %SERVER_HOME%

call npm install restify
call npm install mongo
call npm install mongoose
call npm install client-sessions