var express   = require('express'),
    bodyParser = require('body-parser'),
    https     = require('https'),
    http      = require('http'),
    routes    = require('./routes'),
    routes_pg = require('./lib/routes_pg'),
    routes_ms = require('./lib/routes_ms');

// misc config
var app = module.exports = express();

// Express config
app.use(bodyParser.json());
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});
var port = process.env.PORT || 5001;
var server = app.listen(port, function() {
  console.log('listening on port ', port);
});


// Express routes
app.get('/', routes.index);
app.get('/client.js', routes.client);
app.get('/angular.min.js', routes.angular);
app.get('/angular-route.min.js', routes.angularRoute);
app.get('/jquery.min.js', routes.jquery);
app.get('/todoCtrl.js', routes.todoctrl);
app.get('/todoBlur.js', routes.todoblur);
app.get('/todoFocus.js', routes.todofocus);
app.get('/todoStorage.js', routes.todostorage);
app.get('/base.css', routes.base);
app.get('/bg.png', routes.bg);
app.get('/app.css', routes.appcss);
app.get('/quit', function(req, res) {
  process.exit(1);
});


// Postgres routes
if (typeof routes_pg.createTables !== "undefined") {
  app.get('/createPGTables', routes_pg.createTables);
  app.get('/showPGTables', routes_pg.showTables);
  app.get('/showPGTasks', routes_pg.showTasks);
  app.get('/deletePGTables', routes_pg.deleteTables);
  app.post('/addPGTask', routes_pg.addTask);
  app.get('/deletePGRows', routes_pg.deleteRows);
}

// MySQL routes
if (typeof routes_ms.createTables !== "undefined") {
  app.get('/createMSTables', routes_ms.createTables);
  app.get('/showMSTables', routes_ms.showTables);
  app.get('/showMSTasks', routes_ms.showTasks);
  app.get('/deleteMSTables', routes_ms.deleteTables);
  app.post('/addMSTask', routes_ms.addTask);
  app.get('/deleteMSRows', routes_ms.deleteRows);
}
