/**
 * Created by 3dspa on 27.10.2016.
 */

app.controller('MenuCTRL', function ($scope, $location, $cookies, $routeParams) {
    $scope.$watch('page', function () {
        var cleanPagePath = $location.path().slice(0, ($location.path().length - $location.path().indexOf('/page/')) * -1);
        var currentPage = Number($routeParams.page);
        $scope.sortBy = $routeParams.sortBy;
        if (currentPage > 1)
            $scope.prevPage = cleanPagePath + '/page/' + (currentPage - 1);
        else
            $scope.prevPage = cleanPagePath + '/page/' + currentPage;
        $scope.nextPage = cleanPagePath + '/page/' + (currentPage + 1);
    });
    var layout = $cookies.get('layout');
    if (layout) {
        $scope.layout = layout;
    } else {
        $scope.layout = 'cards';
    }

    $scope.changeLayout = function (layout) {
        $scope.layout = layout;
        $cookies.put('layout', layout)
    };

    $scope.changeRoute = function () {
        $location.path('/' + $scope.layout + '/sort-by/skill/desc/search-by/alias/include/value/' + $scope.player.alias + '/page/1');
    };

    $scope.showFAQ = function () {
        $('.ui.modal.faq').modal('show')
    };
});

app.controller('MainCTRL', function ($scope, $http, $log, $location, $route, $routeParams) {
    $('.ui.dropdown').dropdown();

    $scope.$on('ngRepeatFinished', function () {
        $('.ui.small.progress').progress('remove active');
        $('.ui.small.progress').popup();
    });

    function Steam3IDToSteamCID(steam3ID) {
        var args = ('[U:1:' + steam3ID + ']').split(':');
        var accountID = args[2].replace(']', '');
        var Y, Z;
        if (accountID % 2 === 0) {
            Y = 0;
            Z = accountID / 2;
        } else {
            Y = 1;
            Z = (accountID - 1) / 2
        }
        return String('7656119') + String((Z * 2) + (7960265728 + Y));
    }

    function setIndex(array) {
        var currentPage = Number($routeParams.page) - 1;
        var i = 25 * currentPage;
        _.each(array, function (item) {
            i++;
            item.index = i;
        });
        return array;
    }

    $scope.players = [];
    $scope.player = {
        alias: ''
    };

    $scope.getSteamData = function () {
        var requestArray = '';
        _.each($scope.players, function (player) {
            var steamCID = Steam3IDToSteamCID(player.steamid);
            player.steamCID = steamCID;
            requestArray = requestArray + steamCID + ',';
        });
        $http.post('/get-players-from-steam', {communityIds: requestArray.substring(0, requestArray.length - 1)})
            .then(function successCallback(response) {
                _.each($scope.players, function (player) {
                    _.each(response.data.response.players, function (steamPlayer) {
                        if (player.steamCID === steamPlayer.steamid) {
                            player.steam = steamPlayer
                        }
                    })
                })
            }, function errorCallback(err) {
                $log.error(err);
            });
    };

    $scope.getPlayers = function (param) {
        $http.post('/get-players', param)
            .then(function successCallback(response) {
                $scope.players = setIndex(response.data);
                $scope.getSteamData();
            }, function errorCallback(err) {
                $log.log(err);
            });
    };

    $scope.updatePlayer = function (steamId) {
        function getIndex(id) {
            var index = -1;
            var playerIndex = 0;
            _.each($scope.players, function (player) {
                index++;
                if (_.isMatch(player, {steamid: id})) {
                    return playerIndex = index;
                }
            });
            return playerIndex;
        }

        $http.post('/get-player-by-steamid', {steamid: steamId})
            .then(function successCallback(response) {
                $scope.players[getIndex(response.data.steamid)] = response.data;
                setIndex($scope.players);
                $scope.getSteamData();
            }, function errorCallback(err) {
                $log.log(err);
            });
    };

    $scope.getPlayers($routeParams);
});