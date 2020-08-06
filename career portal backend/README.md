For Team Members

In order to start up the server for the first time:

1. Navigate to the project back-end directory and type "npm install" in the command line.
2. Type npm audit fix to fix the errors if you get any.
3. Create the database (make sure to name it "MyDatabase") and the tables in MySQL using the queries we have in the google doc.
4. Then, in MYSQL still, execute two queries (you can do this in MySQL Workbench):
   FIRST QUERY: 
      "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'
      second: flush privileges;"
   SECOND QUERY: 
      "flush privileges;"
5. Finally in the command line type "npm start" in the back-end project directory.
