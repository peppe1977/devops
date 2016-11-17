'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persist the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
todomvc.controller( 'TodoCtrl', function TodoCtrl(
    $scope, $location, todoStorage, filterFilter, $timeout, $http, $window ) {
  //var todos = $scope.todos = todoStorage.get(); // localstorage

  // stuff for switching between databases
  // - active db initially set to Postgres, and load its data into the app
  // - on switching to mysql, load its data
  $scope.databases = ['Postgres', 'MySQL'];
  $scope.activeDb = $scope.databases[0];
  $scope.$watch('activeDb', function() {
    switch($scope.activeDb) {
      case $scope.databases[0]:
        GetPGAppData();
        break;
      case $scope.databases[1]:
        GetMSAppData();
        break;
    }
  });

  var errorMessage = function(data, status, headers, config) {
    // Skip this function once if both DBs just failed
    if ($scope.pgFailed && $scope.msFailed) {
      $scope.pgFailed = $scope.msFailed = false
      return
    }
    if ((/MS/.test(data) && $scope.activeDb === 'MySQL') ||
        (/PG/.test(data) && $scope.activeDb === 'Postgres')) {
      switch (status) {
        case 404:
        case 503:
          $scope.messageClass = "error";
          $scope.dbMessage = "Error connecting to " + $scope.activeDb;
          break;
        default:
          console.log("UNHANDLED status:", status, data)
      }
    }
  }

  // Show / Hide SQL output
  // initially show the "Show" link
  $scope.SQLToggleLink = 'show'

  // upon clicking Show, set toggle to Hide
  $scope.SQLToggleShowLink = function() {
    $scope.SQLToggleLink = 'hide';
  }

  // on clicking Hide, set toggle to Show
  $scope.SQLToggleHideLink = function() {
    $scope.SQLToggleLink = 'show';
  }

  var pgSuccess = function() {
    if ($scope.activeDb === 'Postgres') {
      $scope.messageClass = "hidden";
      $scope.dbMessage = '';
    }
  }

  var msSuccess = function() {
    if ($scope.activeDb === 'MySQL') {
      $scope.messageClass = "hidden";
      $scope.dbMessage = '';
    }
  }

  // do these things on app load:
  // - try to create tables in postgres, show sql output in textarea
  // - try to create tables in mysql, show sql output in textarea
  // - if both DBs fail, show a friendly warning rather than an error
  function DoStuffAtLoad() {
    // create postgres tables
    $http.get('/createPGTables')
      .success(function(data) {
        pgSuccess();
        // console.log('createPGTables: ', data);
        $scope.pgOutput = '';
        $scope.pgOutput = data;
      })
      .error(function() {
        $scope.pgFailed = true;
        if ($scope.pgFailed && $scope.msFailed) {
          $scope.messageClass = "warning";
          $scope.dbMessage = 'No databases available. Tasks will not be persisted.';
        }
      });

    // create mysql tables
    $http.get('/createMSTables')
      .success(function(data) {
        msSuccess()
        // console.log('createMSTables: ', data);
        $scope.msOutput = '';
        $scope.msOutput = data;
      })
      .error(function() {
        $scope.msFailed = true;
        if ($scope.pgFailed && $scope.msFailed) {
          $scope.messageClass = "warning";
          $scope.dbMessage = 'No databases available. Tasks will not be persisted.';
        }
      });


    // create table links, appear when the input form is hidden
    $scope.CreatePGTablesFormLink = 'hide';
    $scope.CreateMSTablesFormLink = 'hide';
  }
  DoStuffAtLoad();


  // fetches tasks from Postgres, shows them in the UI, and sql output in textarea
  function GetPGAppData() {
    $scope.todos = [];
    $http.get("/showPGTasks")
      .success(function(data) {
        pgSuccess()
        // console.log("/showPGTasks: ", data);
        $scope.pgOutput = '';
        $scope.pgOutput = data;
        $scope.todos = data.rows;
      })
      .error(errorMessage);
  }

  // this is for the UI's "Show Tasks" command
  $scope.showPGTasks = function() {
    GetPGAppData();
  }


  // fetches tasks from MySQL, shows them in UI, and sql output in textarea
  function GetMSAppData() {
    $scope.todos = [];
    $http.get("/showMSTasks")
      .success(function(data) {
        msSuccess()
        // console.log("/showMSTasks: ", data);
        $scope.msOutput = '';
        $scope.msOutput = data;
        $scope.todos = data;
      })
      .error(errorMessage);
  }

  // this is for the UI's "Show Tasks" command
  $scope.showMSTasks = function() {
    GetMSAppData();
  }

  $scope.newTodo = "";
  $scope.editedTodo = null;

  // $scope.$watch('todos', function() {
  //   if ($scope.todos != null) {
  //     // $scope.remainingCount = filterFilter(todos, {completed: false}).length;
  //     // $scope.doneCount = todos.length - $scope.remainingCount;
  //     // $scope.allChecked = !$scope.remainingCount
  //     // todoStorage.put(todos); // localstorage

  //   }
  // }, true);

  // if ( $location.path() === '' ) $location.path('/');
  // $scope.location = $location;

  // $scope.$watch( 'location.path()', function( path ) {
  //   $scope.statusFilter = (path == '/active') ?
  //     { completed: false } : (path == '/completed') ?
  //       { completed: true } : null;
  // });


  $scope.addTodo = function() {
    // var todos = $scope.todos;
    if ( !$scope.newTodo.length ) {
      return;
    }

    // wrap the .push in an if statement,
    // for when Delete Tables has been triggered
    if (!$scope.todos) {
      console.log('set todos to empty array');
      $scope.todos = [];
    }

    var newTodo = {
        title: $scope.newTodo,
        completed: false
    };
    $scope.todos.push(newTodo);
    // console.log('updated $scope.todos: ', $scope.todos);

    if ($scope.activeDb === "Postgres") {
        $http.post('/addPGTask', [newTodo])
            .success(function(data) {
                pgSuccess()
                console.log("postgres addtask success: ", data);
                $scope.pgOutput = '';
                $scope.pgOutput = data;
            })
            .error(errorMessage);
    }

    if ($scope.activeDb == "MySQL") {
        $http.post('/addMSTask', [newTodo])
            .success(function(data) {
                msSuccess();
                console.log("mysql addtask success: ", data);
                $scope.msOutput = '';
                $scope.msOutput = data;
            })
            .error(errorMessage);
    }

    $scope.newTodo = '';
  };

  $scope.editTodo = function( todo ) {
    $scope.editedTodo = todo;
  };


  $scope.doneEditing = function( todo ) {
    $scope.editedTodo = null;
    if ( !todo.title ) {
      $scope.removeTodo(todo);
    }
  };


  $scope.removeTodo = function( todo ) {
    todos.splice(todos.indexOf(todo), 1);
  };


  // $scope.clearDoneTodos = function() {
  //   $scope.todos = todos = todos.filter(function( val ) {
  //     return !val.completed;
  //   });
  // };


  $scope.markAll = function( done ) {
    todos.forEach(function( todo ) {
      todo.completed = done;
    });
  };

  ////////////////////
  // Postgres commands

  $scope.showPGTables = function() {
    $http.get('/showPGTables')
      .success(function(data) {
        pgSuccess();
        console.log("showPGTables: ", data);
        $scope.pgOutput = '';
        $scope.pgOutput = data;
      })
      .error(errorMessage);
  }

  $scope.createPGTables = function() {
    $http.get('/createPGTables')
      .success(function(data) {
        pgSuccess();
        // console.log('createPGTables: ', data);
        $scope.pgOutput = '';
        $scope.pgOutput = data;
        $scope.hiddenForm = 'show'; // show the form if there are db tables
        $scope.CreatePGTablesFormLink = 'hide'; // hide the create link
      })
      .error(errorMessage);
  }

  $scope.deletePGTables = function() {
    $http.get('/deletePGTables')
      .success(function(data) {
        if (data.hint) {
          $scope.messageClass = "error";
          $scope.dbMessage = "Operation denied.";
        } else {
          pgSuccess()
          GetPGAppData();
        }
        // console.log('deletePGTables: ', data);
        $scope.pgOutput = '';
        $scope.pgOutput = data;
        $scope.hiddenForm = 'hide'; // hide the form if no db tables
        $scope.CreatePGTablesFormLink = 'show'; // show create link
      })
      .error(errorMessage);
  }

  $scope.deletePGRows = function() {
    $http.get('/deletePGRows')
      .success(function(data) {
        if (data.hint) {
          $scope.messageClass = "error";
          $scope.dbMessage = "Operation denied.";
        } else {
          pgSuccess();
          GetPGAppData();
        }
        // console.log('deletePGRows: ', data);
        $scope.pgOutput = '';
        $scope.pgOutput = data;
      })
      .error(errorMessage);
  }

  /////////////////
  // MySQL commands

  $scope.showMSTables = function() {
    $http.get('/showMSTables')
      .success(function(data) {
        msSuccess();
        // console.log("showMSTables: ", data);
        $scope.msOutput = '';
        $scope.msOutput = data;
      })
      .error(errorMessage);
  }

  $scope.createMSTables = function() {
    $http.get('/createMSTables')
      .success(function(data) {
        msSuccess()
        // console.log('createMSTables: ', data);
        $scope.msOutput = '';
        $scope.msOutput = data;
        $scope.hiddenForm = 'show'; // show the form if there are db tables
        $scope.CreateMSTablesFormLink = 'hide'; // hide the create link
      })
      .error(errorMessage);
  }

  $scope.deleteMSTables = function() {
    $http.get('/deleteMSTables')
      .success(function(data) {
        if (data.code) {
          $scope.messageClass = "error";
          $scope.dbMessage = "Operation denied.";
        } else {
          msSuccess();
          GetMSAppData();
        }
        // console.log('deleteMSTables: ', data);
        $scope.msOutput = '';
        $scope.msOutput = data;
        $scope.hiddenForm = 'hide'; // hide the form if no db tables
        $scope.CreateMSTablesFormLink = 'show'; // show create link
      })
      .error(errorMessage);
  }

  $scope.deleteMSRows = function() {
    $http.get('/deleteMSRows')
      .success(function(data) {
        if (data.code) {
          $scope.messageClass = "error";
          $scope.dbMessage = "Operation denied.";
        } else {
          msSuccess();
          GetMSAppData();
        }
        // console.log('deleteMSRows: ', data);
        $scope.msOutput = '';
        $scope.msOutput = data;
      })
      .error(errorMessage);
  }
});
