'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
	controller('PlayersCtrl', ['$scope', '$http', 'Player', function($scope, $http, Player) {
		function loadPlayers(players, pos, scoreWeight) {
			angular.forEach (players, function(player, key){
				angular.forEach(player, function(prop, key) {
					if ((!angular.equals(key, "PlayerName")) && (!angular.equals(key, "Team"))){
						prop = parseFloat(prop.replace(',',''));
					}
					player[key] = prop;
				})
				player.pos = pos;
				player.adjustedScore = Math.round((player.fpts * scoreWeight) * 100 ) / 100;
				var newPlayer = new Player(player);
				newPlayer.$save();
			})
		}
		$scope.reloadPlayers = function () {
			//load Player JSON into MongoLab DB
			$http.get('data/qb.json').success(function(data) {
				loadPlayers(data, 'qb', 1.0);
			});
			$http.get('data/rb.json').success(function(data) {
				loadPlayers(data, 'rb', 1.67);
			});
			
			$http.get('data/wr.json').success(function(data) {
				loadPlayers(data, 'wr', 1.67);
			});

			$http.get('data/te.json').success(function(data) {
				loadPlayers(data, 'te', 1.0);
			});

			$http.get('data/k.json').success(function(data) {
				loadPlayers(data, 'k', 1.0);
			});
		};

		$scope.players = Player.query();
		$scope.playerOrderProp = '-adjustedScore';
	}])
	.controller('TeamsCtrl', ['$scope', '$http', 'FTeam', function($scope, $http, FTeam) {
		$scope.fteams = FTeam.query();
		$scope.fteamOrderProp = 'DraftOrder';
	}])
	.controller('DraftOrderCtrl', ['$scope', '$http', 'DraftOrder', 'FTeam', function($scope, $http, DraftOrder, FTeam) {
		$scope.fteams = FTeam.query();
		$scope.fteamOrderProp = 'DraftOrder';
		$scope.saveDraftOrder = function(fteam) {
			fteam.update();
		}

		// sort function that allows sorting by any field
		var sort_by = function(field, reverse, primer){
			var key = function (x) {return primer ? primer(x[field]) : x[field]};

			return function (a,b) {
				var A = key(a), B = key(b);
				return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];                  
			}
		}
		$scope.draftorder = DraftOrder.query();
		$scope.draftorderOrderProp = 'selection';

		/* save 12 rounds for all 12 teams in snake order */
		$scope.generateCompleteDraft = function () {
			console.log('generate complete draft');
			var sortDirection = true;
			var sortedFTeams = $scope.fteams.sort(sort_by('DraftOrder', sortDirection));
			var rounds = 12;
			var selection = 1;
			for(var round=1;round<=rounds;round++) {
				angular.forEach(sortedFTeams, function (fteam, key) {
					var draftingTeam = new DraftOrder();
					draftingTeam.FTeam = fteam._id.$oid;
					draftingTeam.FTeamName = fteam.FantasyTeam;
					draftingTeam.round = round;
					draftingTeam.selection = selection;
					draftingTeam.saveOrUpdate();
					selection += 1;
				});
				sortDirection = !sortDirection;
				sortedFTeams = $scope.fteams.sort(sort_by('DraftOrder', sortDirection));
			}
			$scope.draftorder = DraftOrder.query();
		}
	}])
	.controller('DraftBoardCtrl', ['$scope', '$http', 'FTeam', 'Draft', 'Player', 'DraftOrder', function($scope, $http, FTeam, Draft, Player, DraftOrder) {
		angular.element(document).ready(function() {
			var carousel = angular.element('.carousel');
			carousel.carousel('pause');
			/*
			carousel.on('slid', function(e) {
				selectTeam();
			});
			*/
		});
		
		// Move to a utility module
		// sort function that allows sorting by any field
		var sort_by = function(field, reverse, primer){
			var key = function (x) {return primer ? primer(x[field]) : x[field]};

			return function (a,b) {
				var A = key(a), B = key(b);
				return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];                  
			}
		};
		
		$scope.players = Player.query();
		$scope.playerOrderProp = '-adjustedScore';
		
		$scope.fteams = FTeam.query();

		var filterPlayers = function(pos1, pos2, selected, offset) {
			var returnPlayers = [];
			var playerCount = 0;
			var tempPlayers = $scope.players.sort(sort_by('adjustedScore', false));
			angular.forEach(tempPlayers, function(player, key) {
				if (playerCount < offset && (!player.selected || player.selected == selected) && (angular.equals(player.pos, pos1) || angular.equals(player.pos, pos2))) {
					playerCount++;
					returnPlayers.push(player);
				}
			});
			return returnPlayers;
		};

		var selectTeam = function() {
			$scope.sortedDraftOrder = $scope.DraftOrder.sort(sort_by('selection', true));
			var draftIndex = angular.element('.carousel').find('.carousel-inner > .item.active').index();
			$scope.selectingTeam = $scope.sortedDraftOrder[draftIndex];
		};
		
		$scope.DraftOrder = DraftOrder.query();
		
		$scope.computePlayerDropoff = function() {
			$scope.sortedDraftOrder = $scope.DraftOrder.sort(sort_by('selection', true));
			var draftIndex = angular.element('.carousel').find('.carousel-inner > .item.active').index();
			$scope.selectingTeam = $scope.sortedDraftOrder[draftIndex];

			var selectionOffset = 1;
			for (var i=draftIndex+1;i<$scope.sortedDraftOrder.length;i++) {
				if (angular.equals($scope.sortedDraftOrder[i].FTeamName, $scope.selectingTeam.FTeamName)) {
					break;
				}
				selectionOffset++;
			}
			$scope.selectionGap = selectionOffset;
			//  Show the drop off for each position
			
			var players = filterPlayers('qb', '', false, selectionOffset);
			$scope.dropOffs = [];
			if (players.length > 0) {
				var dropoff = {};
				dropoff.best = players[0];
				dropoff.pos = 'Quarterbacks';
				dropoff.next = players[players.length-1];
				dropoff.value = Math.round((dropoff.best.adjustedScore - dropoff.next.adjustedScore) * 100) / 100;
				$scope.dropOffs.push(dropoff);
			}
			
			players = filterPlayers('rb', '', false, selectionOffset);
			if (players.length > 0) {
				var dropoff = {};
				dropoff.best = players[0];
				dropoff.pos = 'Running Backs';
				dropoff.next = players[players.length-1];
				dropoff.value = Math.round((dropoff.best.adjustedScore - dropoff.next.adjustedScore) * 100) / 100;
				$scope.dropOffs.push(dropoff);
			}
			
			players = filterPlayers('wr', 'te', false, selectionOffset);
			if (players.length > 0) {
				var dropoff = {};
				dropoff.best = players[0];
				dropoff.pos = 'WR / TE';
				dropoff.next = players[players.length-1];
				dropoff.value = Math.round((dropoff.best.adjustedScore - dropoff.next.adjustedScore) * 100) / 100;
				$scope.dropOffs.push(dropoff);
			}
			/*
			players = filterPlayers('def', '', false, selectionOffset);
			if (players.length > 0) {
				var dropoff = {};
				dropoff.best = players[0];
				dropoff.pos = 'Defense';
				dropoff.next = players[players.length-1];
				dropoff.value = Math.round((dropoff.best.adjustedScore - dropoff.next.adjustedScore) * 100) / 100;
				$scope.dropOffs.push(dropoff);
			}
			*/
			players = filterPlayers('k', '', false, selectionOffset);
			if (players.length > 0) {
				var dropoff = {};
				dropoff.best = players[0];
				dropoff.pos = 'Kicker';
				dropoff.next = players[players.length-1];
				dropoff.value = Math.round((dropoff.best.adjustedScore - dropoff.next.adjustedScore) * 100) / 100;
				$scope.dropOffs.push(dropoff);
			}
			
		};
		
		$scope.selectPlayer = function(player) {
			selectTeam();
			$scope.selectingPlayer = player;
		}
		
		$scope.commitSelection = function() {
			// add player to Fantasy Team
			var fteam = FTeam.get({id: $scope.selectingTeam.FTeam}, function() {
				if (!Array.isArray(fteam.players)) {
					fteam.players = [$scope.selectingPlayer];
				} else {
					if (fteam.players.indexOf($scope.selectingPlayer) >= 0) {
						return;
					}
					fteam.players.push($scope.selectingPlayer);
				}
				fteam.update();
				
				// add player to Draft Order
				if (!Array.isArray($scope.selectingTeam.players)) {
					$scope.selectingTeam.players = [$scope.selectingPlayer];
				} else {
					$scope.selectingTeam.players.push($scope.selectingPlayer);
				}
				$scope.selectingTeam.saveOrUpdate();

				// update player as selected
				$scope.selectingPlayer.selected = true;
				$scope.selectingPlayer.saveOrUpdate();
				
				$scope.lastSelection = $scope.selectingTeam.selection-1;
				angular.element('.carousel').carousel('next');
				
				$scope.selectingPlayer = undefined;
				$scope.selectingTeam = undefined;
				
				
			});
			
			// update suggestions
		}
		$scope.removePlayer = function(removePlayer, drafter) {
			var idx = drafter.players.indexOf(removePlayer);
			if (idx >= 0) {
				drafter.players.splice(idx, 1);
				drafter.saveOrUpdate();
			}
			
			var fteam = FTeam.get({id: drafter.FTeam}, function() {
				idx = -1;
				angular.forEach(fteam.players, function(player, key) {
					if (idx == -1 && angular.equals(removePlayer.PlayerName, player.PlayerName)) {
						idx = key;
					}
				});
				if (idx >= 0) {
					fteam.players.splice(idx, 1);
					fteam.saveOrUpdate();
				}
			});

			idx = -1;
			angular.forEach($scope.players, function(player, key) {
				if (idx == -1 && angular.equals(removePlayer.PlayerName, player.PlayerName)) {
					idx = key;
				}
			});
			if (idx >=0) {
				$scope.players[idx].selected = false;
				$scope.players[idx].saveOrUpdate();
			}
		}
	}]);