var express = require('express');
var router = express.Router();
var _ = require('underscore');
var request = require('request');
var tr = require('tor-request');
tr.TorControlPort.password = 'threelo.ru';
var PlayersData = require('../models/PlayersData');
var redisClient = require('../models/Redis');

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

var querysLimit = 25;

router.get('/', function (req, res) {
    res.render('index');
});

router.get('/cards', function (req, res) {
    res.render('list-cards');
});

router.get('/table', function (req, res) {
    res.render('list-table');
});

router.post('/get-players', function (req, res) {
    var requestHash = '';
    var sendResults = function (err, players) {
        if (err) {
            res.send(err)
        }
        else {
            redisClient.set(requestHash, JSON.stringify(players));
            redisClient.expire(requestHash, 1200);
            res.send(players)
        }

    };

    var sortByArray = [];
    var findByArray = [];
    var sortTypeArray = [];
    var searchTypeArray = [];

    //sortByArray['adagrad_sum'] = 'adagrad-sum'; //type: Number
    sortByArray['alias'] = 'alias'; // type: String
    sortByArray['aliens-playtime'] = 'alien_playtime'; // type: Number
    //sortByArray['badges'] = 'badges'; // type:  Array
    //sortByArray['badges_enabled'] = 'badges-enabled'; // type: Boolean
    sortByArray['commander-playtime'] = 'commander_time'; // type: Number
    sortByArray['level'] = 'level'; // type: Number
    sortByArray['marines-playtime'] = 'marine_playtime'; // type: Number
    //sortByArray['pid'] = 'pid'; // type: Number
    sortByArray['ns2-playtime'] = 'time_played'; // type: Number
    //sortByArray['steamid'] = 'steamid'; // type: Number
    sortByArray['skill'] = 'skill'; // type: Number
    sortByArray['score'] = 'score'; // type: Number
    //sortByArray['reinforced_tier'] = 'reinforced_tier'; // type: String
    sortByArray['xp'] = 'xp'; // type: Number
    sortByArray['update'] = 'update'; // type: Date

    findByArray['steamid'] = 'steamid';
    findByArray['alias'] = 'alias';
    findByArray['level'] = 'level';
    findByArray['score'] = 'score';
    findByArray['aliens-playtime'] = 'alien_playtime';
    findByArray['marines-playtime'] = 'marine_playtime';
    findByArray['commander-playtime'] = 'commander_time';
    findByArray['playtime'] = 'time_played';

    sortTypeArray['asc'] = 1;
    sortTypeArray['desc'] = -1;

    searchTypeArray['gt'] = 'gt';
    searchTypeArray['lt'] = 'lt';
    searchTypeArray['equals'] = 'equals';
    searchTypeArray['include'] = 'include';

    var findBy = req.body.findBy;
    !findBy ? findBy = 'alias' : true;
    var sortBy = req.body.sortBy;
    !sortBy ? sortBy = 'skill' : true;
    var sortType = req.body.sortType;
    !sortType ? sortType = 'desc' : true;
    var searchType = req.body.searchType;
    !searchType ? searchType = 'include' : true;
    var valueFor = req.body.valueFor;
    !valueFor ? valueFor = '' : true;
    var page = req.body.page;
    !page ? page = 1 : true;

    function find(findBy, sortType, sortBy, searchType, valueFor, page) {
        console.log('findBy: ' + findBy);
        console.log('sortType: ' + sortType);
        console.log('sortBy: ' + sortBy);
        console.log('searchType: ' + searchType);
        console.log('valueFor: ' + valueFor);
        console.log('page: ' + querysLimit * page);
        switch (findBy) {
            case 'alias':
                var param = '';
                searchType === 'equals' ? param = valueFor : param = new RegExp(valueFor, "i");
                PlayersData
                    .find()
                    .where('alias').equals(param)
                    .limit(querysLimit)
                    .skip(Number(querysLimit * (page - 1)))
                    .sort([[sortBy, sortType]])
                    .exec(sendResults);
                break;
            default:
                switch (searchType) {
                    case 'gt':
                        PlayersData
                            .find()
                            .where(findBy).gt(valueFor)
                            .limit(querysLimit)
                            .skip(Number(querysLimit * page))
                            .sort([[sortBy, sortType]])
                            .exec(sendResults);
                        break;
                    case 'lt':
                        PlayersData
                            .find()
                            .where(findBy).lt(valueFor)
                            .limit(querysLimit)
                            .skip(Number(querysLimit * page))
                            .sort([[sortBy, sortType]])
                            .exec(sendResults);
                        break;
                    default:
                        PlayersData
                            .find()
                            .where(findBy).equals(valueFor)
                            .limit(querysLimit)
                            .skip(Number(querysLimit * page))
                            .sort([[sortBy, sortType]])
                            .exec(sendResults);
                        break;
                }
                break;
        }
    }

    console.log(findByArray[findBy], sortByArray[sortBy], sortTypeArray[sortType], searchTypeArray[searchType], page);
    if (findByArray[findBy] && sortByArray[sortBy] && sortTypeArray[sortType] && searchTypeArray[searchType]) {
        find(findByArray[findBy], sortTypeArray[sortType], sortByArray[sortBy], searchTypeArray[searchType], valueFor, page);
        /*
        requestHash = findByArray[findBy] + sortByArray[sortBy] + sortTypeArray[sortType] + searchTypeArray[searchType] + valueFor + page;
        redisClient.get(requestHash, function (err, players) {
            if (err) {
                console.log(err);
            } else {
                if (players) {
                    res.send(players);
                } else {
                    find(findByArray[findBy], sortTypeArray[sortType], sortByArray[sortBy], searchTypeArray[searchType], valueFor, page);
                }

            }
        })*/
    } else {
        res.send([]);
    }
});

router.post('/get-player-by-steamid', function (req, res) {
    function updatePlayer(steamid) {
        tr.request({
            uri: 'http://hive2.ns2cdt.com/api/get/playerData/' + Number(steamid),
            method: 'GET'
        }, function (err, response, body) {
            console.log(body);
            if (err) {
                res.send(err)
            } else {
                if (isJson(body)) {
                    var playerObj = JSON.parse(body);
                    var findPlayerPromise = new Promise(function (resolve, reject) {
                        PlayersData.findOne({steamid: playerObj.steamid}, function (err, player) {
                            if (err) {
                                reject(err)
                            } else {
                                resolve(player)
                            }
                        });
                    });
                    findPlayerPromise
                        .then(function (player) {
                            if (player) {
                                player.adagrad_sum = playerObj.adagrad_sum;
                                player.alias = playerObj.alias;
                                player.alien_playtime = playerObj.alien_playtime;
                                player.badges = playerObj.badges;
                                player.badges_enabled = playerObj.badges_enabled;
                                player.commander_time = playerObj.commander_time;
                                player.level = playerObj.level;
                                player.marine_playtime = playerObj.marine_playtime;
                                player.pid = playerObj.pid;
                                player.time_played = playerObj.time_played;
                                player.steamid = playerObj.steamid;
                                player.skill = playerObj.skill;
                                player.score = playerObj.score;
                                player.reinforced_tier = playerObj.reinforced_tier;
                                player.xp = playerObj.xp;
                                player.update = new Date().getTime();
                                player.save(function (err, player) {
                                    err
                                        ? res.send(err)
                                        : res.send(player);
                                })
                            } else {
                                playerObj.adagrad_sum === null
                                    ? playerObj.adagrad_sum = 0
                                    : 0;
                                playerObj.reinforced_tier === null
                                    ? playerObj.reinforced_tier = 0
                                    : 0;
                                playerObj.badges === null
                                    ? playerObj.badges = []
                                    : 0;
                                PlayersData.create({
                                    adagrad_sum: playerObj.adagrad_sum,
                                    alias: playerObj.alias,
                                    alien_playtime: playerObj.alien_playtime,
                                    badges: playerObj.badges,
                                    badges_enabled: playerObj.badges_enabled,
                                    commander_time: playerObj.commander_time,
                                    level: playerObj.level,
                                    marine_playtime: playerObj.marine_playtime,
                                    pid: playerObj.pid,
                                    time_played: playerObj.time_played,
                                    steamid: playerObj.steamid,
                                    skill: playerObj.skill,
                                    score: playerObj.score,
                                    reinforced_tier: playerObj.reinforced_tier,
                                    xp: playerObj.xp,
                                    update: new Date().getTime()
                                }, function (err, player) {
                                    err
                                        ? res.send(err)
                                        : res.send(player);
                                });
                            }
                        }).catch(function (err) {
                        res.send(err);
                    });
                } else {
                    res.send({msg: 'Hive2 got no valid response'});
                }
            }
        });
    }

    var updateResult = function (err, player) {
        if (err) {
            res.send(err)
        } else {
            updatePlayer(player.steamid)
        }
    };

    if (req.body.steamid && req.body.steamid !== '') {
        PlayersData
            .findOne({steamid: req.body.steamid})
            .exec(updateResult);
    } else {
        PlayersData
            .findOne({steamid: 83750404})
            .exec(updateResult);
    }
});

router.post('/get-players-from-steam', function (req, res) {
    var apiURL = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?';
    var key = '51EB587C3DCA5E0680BA23950BC07083';
    var URL = apiURL + 'key=' + key + '&steamids=' + req.body.communityIds;
    redisClient.get(req.body.communityIds, function (err, players) {
        if (err) {
            console.log(err);
            getSteamPlayers();
        } else {
            if (players) {
                res.send(JSON.parse(players));
            } else {
                getSteamPlayers();
            }

        }
    });
    function getSteamPlayers() {
        request(URL, function (error, response, players) {
            redisClient.set(req.body.communityIds, JSON.stringify(players));
            redisClient.expire(req.body.communityIds, 300);
            res.send(players)
        });
    }
});

module.exports = router;
