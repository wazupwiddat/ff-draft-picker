'use strict';
angular.module('myApp.services', ['ngResource']).
  factory('Player', function($resource) {
    var Player = $resource('https://api.mongolab.com/api/1/databases/ffdraft/collections/player/:id',	
		{ apiKey: 'HYN-FoMtDZ658fWS9_HAOSti3Io8F7pQ', id: '@_id.$oid' },
		{ update: {method: 'PUT'}});
	
	Player.prototype.update = function (cb, errorcb) {
      return Player.update({id:this._id.$oid}, angular.extend({}, this, {_id:undefined}), cb, errorcb);
    };

	Player.prototype.saveOrUpdate = function (savecb, updatecb, errorSavecb, errorUpdatecb) {
      if (this._id && this._id.$oid) {
        return this.update(updatecb, errorUpdatecb);
      } else {
        return this.$save(savecb, errorSavecb);
      }
    };
	
	return Player;
  }).
  factory('FTeam', function($resource) {
    var FTeam = $resource('https://api.mongolab.com/api/1/databases/ffdraft/collections/fteam/:id',
		{ apiKey: 'HYN-FoMtDZ658fWS9_HAOSti3Io8F7pQ', id: '@_id.$oid' },
		{ update: {method: 'PUT'}});

	FTeam.prototype.update = function (cb, errorcb) {
      return FTeam.update({id:this._id.$oid}, angular.extend({}, this, {_id:undefined}), cb, errorcb);
    };

	FTeam.prototype.saveOrUpdate = function (savecb, updatecb, errorSavecb, errorUpdatecb) {
      if (this._id && this._id.$oid) {
        return this.update(updatecb, errorUpdatecb);
      } else {
        return this.$save(savecb, errorSavecb);
      }
    };

	return FTeam;
  }).
  factory('Draft', function($resource) {
    return $resource('https://api.mongolab.com/api/1/databases/ffdraft/collections/draft',	
		{ apiKey: 'HYN-FoMtDZ658fWS9_HAOSti3Io8F7pQ' });
  }).
  factory('DraftOrder', function($resource) {
    var DraftOrder = $resource('https://api.mongolab.com/api/1/databases/ffdraft/collections/draftorder/:id',	
		{ apiKey: 'HYN-FoMtDZ658fWS9_HAOSti3Io8F7pQ', id: '@_id.$oid' },
		{ update: {method: 'PUT'}});

	DraftOrder.prototype.update = function (cb, errorcb) {
      return DraftOrder.update({id:this._id.$oid}, angular.extend({}, this, {_id:undefined}), cb, errorcb);
    };
    
	DraftOrder.prototype.saveOrUpdate = function (savecb, updatecb, errorSavecb, errorUpdatecb) {
      if (this._id && this._id.$oid) {
        return this.update(updatecb, errorUpdatecb);
      } else {
        return this.$save(savecb, errorSavecb);
      }
    };

	return DraftOrder;
  }).
  factory('DraftStats', function() {
	return {
		getMinPremiumFactor: function() {
			return 1.0;
		}
		
	}
  }).
  value('version', '0.1');
