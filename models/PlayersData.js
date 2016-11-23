/**
 * Created by 3dspa on 27.10.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PlayersData = new Schema({
    adagrad_sum: {
        type: Number,
        default: 0
    },
    alias: {
        type: String,
        default: ''
    },
    alien_playtime: {
        type: Number,
        default: 0
    },
    badges: {
        type: Array,
        default: []
    },
    badges_enabled: {
        type: Boolean,
        default: false
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
    pid: {
        type: Number,
        default: 0
    },
    time_played: {
        type: Number,
        default: 0
    },
    steamid: {
        type: Number,
        default: 0,
        unique: true
    },
    skill: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    },
    reinforced_tier: {
        type: String,
        default: ''
    },
    xp: {
        type: Number,
        default: 0
    },
    deleted: false,
    update: {
        type: Date,
        default: new Date()
    },
    data: {
        type: String,
        default: ''
    },
    tracking: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('PlayersData', PlayersData);