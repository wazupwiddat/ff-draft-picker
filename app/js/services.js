'use strict';
angular.module('myApp.services', ['ngResource']).
  factory('Player', function($resource) {
    return $resource('https://api.mongolab.com/api/1/databases/ffdraft/collections/player',	
		{ apiKey: 'HYN-FoMtDZ658fWS9_HAOSti3Io8F7pQ' },
		{ update: {method: 'PUT'}});
  }).
  factory('FTeam', function($resource) {
    var FTeam = $resource('https://api.mongolab.com/api/1/databases/ffdraft/collections/fteam/:id',
		{ apiKey: 'HYN-FoMtDZ658fWS9_HAOSti3Io8F7pQ', id: '@_id.$oid' },
		{ update: {method: 'PUT'}});

	FTeam.prototype.update = function (cb, errorcb) {
      return FTeam.update({id:this._id.$oid}, angular.extend({}, this, {_id:undefined}), cb, errorcb);
    };
	return FTeam;
  }).
  factory('Draft', function($resource) {
    return $resource('https://api.mongolab.com/api/1/databases/ffdraft/collections/draft',	
		{ apiKey: 'HYN-FoMtDZ658fWS9_HAOSti3Io8F7pQ' });
  }).
  factory('DraftOrder', function($resource) {
    var DraftOrder = $resource('https://api.mongolab.com/api/1/databases/ffdraft/collections/draftorder',	
		{ apiKey: 'HYN-FoMtDZ658fWS9_HAOSti3Io8F7pQ'},
		{ update: {method: 'PUT'}});

	return DraftOrder;
  }).
  value('version', '0.1');
