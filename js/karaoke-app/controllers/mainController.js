app.controller("mainController", function ($scope, $http, $filter, ngTableParams) {
    $scope.results = [];
    $scope.filterText = null;
    $scope.availableLangs = [];
    $scope.langFilter = null;

    $scope.totalPages = 0;
    $scope.songsCount = 0;
    $scope.songsPerPage = 50;
    $scope.currentPage = 0;

    $scope.init = function () {
        $http({
            method: 'GET',
            url: 'http://tcstudio.org/jsonp.php?p=0&pp=50&callback=JSON_CALLBACK'
        })
            .success(function (data) {
                angular.forEach(data, function (song, index) {
                    $scope.results.push(song);
                    var exists = false;
                    angular.forEach($scope.availableLangs, function (avLang, index) {
                        if (avLang === song.lang) {
                            exists = true;
                        }
                    });
                    if (exists === false) {
                        $scope.availableLangs.push(song.lang);
                    }
                });
                $scope.tableParams = new ngTableParams({
                    page: 1,            // show first page
                    count: 10           // count per page
                }, {
                    groupBy: function(item) {
                        return item.singer;
                    },
                    total: $scope.results.length, // length of data
                    getData: function ($defer, params) {
                        var orderedData = params.filter() ? $filter('filter')(data, params.filter()) : data;

                        $scope.results = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                        params.total(orderedData.length); // set total for recalc pagination
                        $defer.resolve($scope.results);
                    }
                });
                $scope.$watch('langFilter', function(value){
                    if (value !== null) {
                        $scope.tableParams.$params.filter = { lang: value };
                        $scope.tableParams.reload();
                    }
                });
            }).error(function (data, status, headers, config) {
                console.log(data);
                console.log(status);
                console.log(headers);
                console.log(config);
            });

    };
});

app.filter('isLang', function() {
    return function(input, lang) {

        if (typeof lang === 'undefined' || lang === null) {
            return input;
        } else {
            var out = [];
            for (var i = 0; i < input.length; i++){
                if(input[i].lang === lang) {
                    out.push(input[i]);
                }
            }
            return out;
        }
    };
});

app.filter('songSearch', function() {
   return function(songs, searchText) {
        var searchRegx = new RegExp(searchText, "i");
        if ((searchText == undefined)) {
            return songs;
        }
        var result = [];
        for(var i = 0; i < songs.length; i++) {
            if (songs[i].singer.search(searchRegx) != -1 ||
                songs[i].title.search(searchText) != -1) {
                result.push(songs[i]);
            }
        }
        return result;
    }
});