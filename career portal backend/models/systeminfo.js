var db = require("./db");
const filereader = require("filereader");

// Set up User class
var SystemInfo = function (user) {
  var that = Object.create(SystemInfo.prototype);

  that.event_time = SystemInfo.event_time;
  that.command_type = SystemInfo.command_type;
  that.argument = SystemInfo.argument;

  return that;
};

// List all activities
// callback(err, activities)
var listActivities = function (callback) {
  db.query(
    "SELECT argument, event_time, command_type FROM mysql.general_log",
    function (err, rows) {
      if (err) return callback(err);
      var sysactivities = [];
      rows.forEach(function (row) {
        sysactivities.push({
          event_time: row.event_time,
          command_type: row.command_type,
          description: row.argument,
        });
      });
      return callback(null, rows);
    }
  );
};

exports.listActivities = listActivities;
