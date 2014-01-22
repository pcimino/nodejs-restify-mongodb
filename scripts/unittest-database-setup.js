db.sessionkeys.drop();
db.users.drop();

db.sessionkeys.insert({"key" : "52de8440f5b0b9c03748a4e3","_id" : ObjectId("52de8440f5b0b9c03748a4e2")});
db.users.insert({"username":"admin","name":"admin","email":"admin@admin.com","hashed_password":"8eebd18781692cf8c4566a6522546cc7bf9f0e01","_id":ObjectId("52de8474f5b0b9c03748a4e4"),"tempPasswordFlag":false,"role":"Admin","emailValidatedFlag":true,"newEmail":""});
db.users.insert({"username":"user","name":"user", "email":"user@user.com","hashed_password":"6bfa7a2a069e929bf3e14dcd388d4add104c7819","_id":ObjectId("52de84fcf5b0b9c03748a4e7"),"tempPasswordFlag":false,"role":"User", "emailValidatedFlag":true,"newEmail":""});