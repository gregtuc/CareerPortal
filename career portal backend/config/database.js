// This is an example database config file. Replace these presets with your database info and add this file to your .gitignore.
module.exports = {
  connection: {
    host: "localhost",
    user: "root",
    password: "root",
    queueLimit: 0, // unlimited queueing
    connectionLimit: 0, // unlimited connections
  },
  database: "MyDatabase",
};
