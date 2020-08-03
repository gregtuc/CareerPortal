For Team Members:

1. npm install
2. npm audit fix
3. node /scripts/dbsetup
4. On this database execute two queries (you can do this in MySQL Workbench):
   first: ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'
   second: flush privileges;
5. npm start
