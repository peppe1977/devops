var pg = require('pg');
var _ = require('underscore');

// pg config, locally it's tcp://USERNAME@localhost:5432/tododb

var pgURI = process.env.POSTGRES_URI;

if (typeof pgURI !== "undefined") {
  exports.createTables = function(req, res) {
    pg.connect(pgURI, function(err, client, done) {
      if (err) {
        console.error(err);
        return;
      }

      client.query('CREATE TABLE tasks (title text, completed boolean);', function(err, result) {
        if (err) {
          console.error('PGcreateTables error: ', err);
          res.send(err);
          return;
        }

        console.log('PGcreateTables result: ', result);
        res.send(result);
      });

      done();
    });
  };


  exports.showTables = function(req, res) {
    pg.connect(pgURI, function(err, client, done) {
      if (err) {
        console.error(err);
        return;
      }

      client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';", function(err, result) {
        if (err) {
          console.error('PGshowTables error: ', err);
          res.send(err);
          return;
        }

        console.log('PGshowTables result: ', result);
        res.send(result);
      });

      done();
    });
  };

  exports.showTasks = function(req, res) {
    pg.connect(pgURI, function(err, client, done) {
      if (err) {
        console.error(err);
        return;
      }

      client.query('SELECT title, completed FROM tasks;', function(err, result) {
        if (err) {
          console.error('PGshowTasks error: ', err);
          res.send(err);
          return;
        }

        console.log('PGshowTasks result: ', result);
        res.send(result);
      });

      done();
    });
  };

  exports.deleteTables = function(req, res) {
    pg.connect(pgURI, function(err, client, done) {
      if (err) {
        console.error(err);
        return;
      }

      client.query("DROP TABLE tasks;", function(err, result) {
        if (err) {
          console.error('PGdeleteTables error: ', err);
          res.send(err);
          return;
        }

        console.log('PGdeleteTables result: ', result);
        res.send(result);
      });

      done();
    });
  };

  exports.addTask = function(req, res) {
    pg.connect(pgURI, function(err, client, done) {
      if (err) {
        console.error(err);
        return;
      }

      // console.log('request body full: ', req.body);
      var taskArray = req.body;
      var taskValues = _.map(taskArray, function(task) {
        var valueTitle = "'" + task.title + "'";
        var valueCompleted = "'" + task.completed + "'";
        return "(" + valueTitle + ", " + valueCompleted + ")";
      });

      var qs = 'INSERT into tasks (title, completed) VALUES ' + taskValues.join() + ";";
      console.log(qs);
      client.query(qs, function(err, result) {
        if (err) {
          console.error('PGaddTask error: ', err);
          res.send(err);
          return;
        }

        console.log('PGaddTask result: ', result);
        res.send(result);
      });

      done();
    });
  };

  exports.deleteRows = function(req, res) {
    pg.connect(pgURI, function(err, client, done) {
      if (err) {
        console.error(err);
        return;
      }

      client.query("DELETE FROM tasks;", function(err, result) {
        if (err) {
          console.error('PGdeleteRows error: ', err);
          res.send(err);
          return;
        }

        console.log('PGdeleteRows success: ', result);
        res.send(result);
      });

      done();
    });
  };
}
