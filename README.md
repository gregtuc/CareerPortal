Quick Start Guide with MySQL 8.0:

1. In your command window, use "npm install" to install dependencies. Be sure to audit any modules that require updated versions.
2. Create the database (program expected it to be named "MyDatabase" by default) and the SQL relations defined below.
3. Execute two queries (you can do this in MySQL Workbench):
   FIRST QUERY:
   "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'
   SECOND QUERY:
   flush privileges;
4. Finally in the command line type "npm start" to initiate the server on localhost port 8000.
