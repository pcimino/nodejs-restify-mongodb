# Assumes server is in parent directory, set to absolute path to run script from anywhere
export SERVER_HOME=.. 
# Development is the default environment, showing how to do it explicitly
export NODE_ENV=development 
cd $SERVER_HOME 
node app.js 