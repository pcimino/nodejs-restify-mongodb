REM Assumes MONGODB is set to the installation directory 
echo any key to shut down the db server
pause

%MONGODB%\bin\mongo --eval "db.getSiblingDB('admin').shutdownServer()"
