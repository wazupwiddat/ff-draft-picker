'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/board', {templateUrl: 'partials/draftboard.html', controller: 'DraftBoardCtrl'});
    $routeProvider.when('/players', {templateUrl: 'partials/players.html', controller: 'PlayersCtrl'});
    $routeProvider.when('/teams', {templateUrl: 'partials/teams.html', controller: 'TeamsCtrl'});
    $routeProvider.when('/draftorder', {templateUrl: 'partials/draftorder.html', controller: 'DraftOrderCtrl'});
    $routeProvider.otherwise({redirectTo: '/players'});
  }]);
