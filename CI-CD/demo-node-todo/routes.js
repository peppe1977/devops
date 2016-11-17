exports.index = function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
}

exports.client = function(req, res) {
  res.sendfile(__dirname + '/public/js/client.js');
}

exports.angular = function(req, res) {
  res.sendfile(__dirname + '/public/js/angular.min.js');
}

exports.angularRoute = function(req, res) {
  res.sendfile(__dirname + '/public/js/angular-route.min.js');
}

exports.jquery = function(req, res) {
  res.sendfile(__dirname + '/public/js/jquery-2.1.1.min.js');
}

exports.todoctrl = function(req, res) {
  res.sendfile(__dirname + '/public/js/todoCtrl.js');
}

exports.todoblur = function(req, res) {
  res.sendfile(__dirname + '/public/js/todoBlur.js');
}

exports.todofocus = function(req, res) {
  res.sendfile(__dirname + '/public/js/todoFocus.js');
}

exports.todostorage = function(req, res) {
  res.sendfile(__dirname + '/public/js/todoStorage.js');
}

exports.base = function(req, res) {
  res.sendfile(__dirname + '/public/css/base.css');
}

exports.appcss = function(req, res) {
  res.sendfile(__dirname + '/public/css/app.css');
}

exports.bg = function(req, res) {
  res.sendfile(__dirname + '/public/img/bg.png');
}
