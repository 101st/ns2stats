/**
 * Created by 3dspa on 27.10.2016.
 */
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

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

app.controller('MenuCTRL', function ($scope, $location, $cookies, $routeParams) {
    $scope.currentPage = 1;
    $scope.layouts = [
        {name: 'Cards', url: 'cards'},
        {name: 'Cards v.2', url: 'cards-v2'},
        {name: 'Table', url: 'table'}
    ];
    $scope.$watch(['page'], function () {
        var cleanPagePath = $location.path().slice(0, ($location.path().length - $location.path().indexOf('/page/')) * -1);
        var currentPage = $scope.currentPage = Number($routeParams.page);
        $scope.sortBy = $routeParams.sortBy;
        if (currentPage > 1)
            $scope.prevPage = cleanPagePath + '/page/' + (currentPage - 1);
        else
            $scope.prevPage = cleanPagePath + '/page/' + currentPage;
        $scope.nextPage = cleanPagePath + '/page/' + (currentPage + 1);
    });
    var layout = isJson($cookies.get('layout'));
    if (layout) {
        $scope.layout = JSON.parse($cookies.get('layout'));
    } else {
        $scope.layout = {url: 'cards', name: 'Cards'}
    }

    $scope.changeLayout = function (layout) {
        $location.path($location.path().replace($scope.layout.url, layout.url));
        $scope.layout = layout;
        $cookies.put('layout', JSON.stringify(layout));
    };

    $scope.changeRoute = function () {
        $location.path('/' + $scope.layout.url + '/sort-by/skill/desc/search-by/alias/include/value/' + $scope.player.alias + '/page/1');
    };

    $scope.showFAQ = function () {
        $('.ui.modal.faq').modal('show')
    };
});

app.controller('MainCTRL', function ($scope, $http, $log, $location, $route, $routeParams) {
    $('.ui.dropdown').dropdown();

    $scope.$on('ngRepeatFinished', function () {
        var uiSmallProgress = $('.ui.small.progress');
        var popupElems = $('[data-content]');
        uiSmallProgress.progress('remove active');
        popupElems.popup();
    });

    function setIndex(array) {
        var currentPage = Number($routeParams.page) - 1;
        var i = 25 * currentPage;
        _.each(array, function (item) {
            i++;
            item.index = i;
            item.steam = {avatarfull: '/images/steam_default_avatar.jpg'};
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
                if (isJson(response.players)) {
                    _.each($scope.players, function (player) {
                        _.each(response.data.response.players, function (steamPlayer) {
                            if (player.steamCID === steamPlayer.steamid) {
                                player.steam = steamPlayer
                            }
                        })
                    })
                } else {
                    $scope.getSteamData();
                }
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

app.controller('PlayerCTRL', function ($scope, $http, $log, $routeParams) {
    $scope.verify = true;
    $scope.loader = false;
    $scope.setWidgetId = function (widgetId) {
        // store the `widgetId` for future usage.
        // For example for getting the response with
        // `recaptcha.getResponse(widgetId)`.
    };

    $scope.setResponse = function (response) {
        $scope.loader = true;
        // send the `response` to your server for verification.
        $http.post('/verify', {gReCaptchaResponse: response, steamId: $routeParams.steamId})
            .then(function successCallback(response) {
                if (response.data.tracking === true) {
                    $scope.verify = false;
                    $scope.loader = false;
                }
            }, function errorCallback(err) {
                $log.log(err);
            });
    };

    $scope.cbExpiration = function () {
        // reset the 'response' object that is on scope
    };
});