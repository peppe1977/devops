'use strict';

/**
 * Services that persists and retrieves TODOs from localStorage.
 */
todomvc.factory( 'todoStorage', function() {
  var STORAGE_ID = 'todos-angularjs';

  return {
    get: function() {
      console.log('get called');

      var todos = JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
      return todos;

    },

    put: function( todos ) {
    	console.log('put called');
    	console.log(todos);
      localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
    }
  };
});
