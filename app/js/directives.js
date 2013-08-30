'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
  directive('draftboard', function() {
    return {
	  restrict: 'EA',
	  template: '<div class="draftboard"></div>',
	  replace: true,
	  transclude: true,
	  require: 'draftboard',
	  controller: 'DraftOrderCtrl',
	  scope: {
	    currentSelection: '='
	  },
	  link: function(scope, elem, attrs) {
	    scope.$watch('currentSelection', function(oldVal, newVal) {
		  console.log(scope.currentSelection);
		});
	  }
	}
  }).
  directive('drafter', function() {
    return {
	  restrict: 'EA',
	  template: '<div>Team here</div>',
	  replace: true,
	  transclude: true,
	  require: '^draftboard',
	  scope: {
	  }
	}
  });
