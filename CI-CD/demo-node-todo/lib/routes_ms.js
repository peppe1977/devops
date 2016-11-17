var mysql = require('mysql'),
    _     = require('underscore'),
    msUrl = process.env.MYSQL_URI || process.env.DEMOMYSQL_URI

if (typeof msUrl !== "undefined") {
  // mysql config
  var msConnection = mysql.createConnection(msUrl);

  msConnection.connect(function(err) {
    if (err) {
      console.log('- mysql connect error: ', err);
    }
  });

  exports.createTables = function(req, res) {
    msConnection.query('CREATE TABLE tasks (title text, completed boolean);', function(err, rows, fields) {
      if (err) {
        console.log('- mysql createTables error: ', err);
        res.send(err);
      } else {
        console.log('- mysql createTables rows: ', rows);
        res.send(rows);
      }
    });
  }

  exports.showTables = function(req, res) {
    msConnection.query("SHOW TABLES", function(err, rows, fields) {
      if (err) {
        console.log('- mysql showTables error: ', err);
        res.send(err);
      } else {
        console.log('- mysql showTables rows: ', rows);
        res.send(rows);
      }
    });
  }

  exports.showTasks = function(req, res) {
    msConnection.query('select title, completed from tasks;', function(err, rows, fields) {
      if (err) {
        console.log('- mysql showTasks error: ', err);
        res.send(err);
      } else {
        console.log('- mysql showTasks rows: ', rows);
        res.send(rows);
      }
    });
  }

  exports.deleteTables = function(req, res) {
    msConnection.query('drop table tasks;', function(err, rows, fields) {
      if (err) {
        console.log('- mysql deleteTables error: ', err);
        res.send(err);
      } else {
        console.log('- mysql deleteTables rows: ', rows);
        res.send(rows);
      }
    });
  }

  exports.addTask = function(req, res) {
    console.log('- mysql addtask request body: ', req.body);
    var taskArray = req.body;
    _.each(taskArray, function(task) {
      var valueTitle = "'" + task.title + "'",
          valueFull = "(" + valueTitle + ", " + task.completed + ")";
          console.log('- mysql valueFull: ', valueFull);
      msConnection.query('insert into tasks (title, completed) values' + valueFull + ";", function(err, rows, fields) {
        if (err) {
          console.log('- mysql addTask error: ', err);
          res.send(err);
        } else {
          console.log('- mysql addTask result: ', rows);
          res.send(rows);
        }
      });
    });
  }

  exports.deleteRows = function (req, res) {
    msConnection.query('delete from tasks;', function(err, rows, fields) {
      if (err) {
        console.log('- mysql deleteRows error: ', err);
        res.send(err);
      } else {
        console.log('- mysql deleteRows rows: ', rows);
        res.send(rows);
      }
    });
  }

  function handleDisconnect(connection) {
    connection.on('error', function(err) {
      if (!err.fatal) {
        return;
      }

      if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
        throw err;
      }

      console.log('Re-connecting lost connection: ' + err.stack);

      msConnection = mysql.createConnection(connection.config);
      handleDisconnect(msConnection);
      msConnection.connect();
    });
  }

  handleDisconnect(msConnection);

  // msConnection.end(function(err) {
  //   if (err) {
  //     console.log('mysql disconnect error: ', err);
  //   }
  // });
}
