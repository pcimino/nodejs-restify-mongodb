# Assumes MONGODB is set to the installation directory 
$MONGODB/bin/mongo --eval "db.getSiblingDB('admin').shutdownServer()" 