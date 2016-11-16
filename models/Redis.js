/**
 * Created by 3dspa on 03.11.2016.
 */
var redis = require("redis"),
    redisClient = redis.createClient();

redisClient.on("connect", function () {
    console.log("Redis connected");
});

redisClient.on("error", function (err) {
    console.log("Redis error: " + err);
});

module.exports = redisClient;