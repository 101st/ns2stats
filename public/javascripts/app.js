/**
 * Created by 3dspa on 27.10.2016.
 */
var app = angular.module('app', ['ngRoute', 'ngCookies']);

app.factory('cache', ['$cacheFactory', function ($cacheFactory) {
    return $cacheFactory('ns2');
}]);

app.filter('subString', function () {
    return function (input, param) {
        if (input && input.length > param) {
            return input.substring(0, param) + ' ...'
        } else {
            return input
        }
    }
});

app.filter('toFix', function () {
    return function (input, param) {
        if (_.isNumber(Number(param))) {
            param > 20 ? param = 20 : true;
            param < 0 ? param = null : true;
            return input.toFixed(param)
        } else {
            return input
        }
    }
});

app.filter('msToTime', function () {
    return function (s) {
        seconds = s;
        minutes = Math.floor(seconds / 60);
        hours = Math.floor(minutes / 60);
        days = Math.floor(hours / 24);

        hours = hours - (days * 24);
        minutes = minutes - (days * 24 * 60) - (hours * 60);
        seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);

        minutes < 10 ? minutes = "0" + minutes : true;
        seconds < 10 ? seconds = "0" + seconds.toFixed() : seconds = seconds.toFixed();

        if (days > 0) {
            return days + ' days, ' + hours + ":" + minutes + ":" + seconds;
        } else {
            return hours + ":" + minutes + ":" + seconds;
        }
    }
});

app.filter('timeAgo', function () {
    return function (input) {
        var date = new Date();
        var input = new Date(input);
        if (_.isDate(input)) {
            input < date ? input = date - input : true;
            input > date ? input = date : true;
            return input / 1000;
        } else {
            return date;
        }
    }
});

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

app.directive('ngFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.ngFinishRender);
                });
            }
        }
    }
});

app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/:viewType/sort-by/:sortBy/:sortType/search-by/:findBy/:searchType/value/:valueFor/page/:page', {
                templateUrl: function (routeParam) {
                    return '/' + routeParam.viewType;
                }
            })
            .when('/:viewType/sort-by/:sortBy/:sortType/search-by/:findBy/:searchType/page/:page/value/', {
                templateUrl: function (routeParam) {
                    return '/' + routeParam.viewType;
                }
            })
            .when('/:viewType/sort-by/:sortBy/:sortType/page/:page', {
                templateUrl: function (routeParam) {
                    return '/' + routeParam.viewType;
                }
            })
            .otherwise('/cards/sort-by/skill/desc/page/1');
    }]);