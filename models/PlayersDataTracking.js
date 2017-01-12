/**
 * Created by 3dspa on 27.10.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PlayersDataTracking = new Schema({
    alien_playtime: {
        type: Number,
        default: 0
    },
    commander_time: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 0
    },
    marine_playtime: {
        type: Number,
        default: 0
    },
    steamid: {
        type: Number,
        default: 0,
    },
    skill: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    },
    xp: {
        type: Number,
        default: 0
    },
    deleted: false,
    update: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('PlayersDataTracking', PlayersDataTracking);