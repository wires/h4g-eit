var _ = require('lodash');
var Q = require('kew');
var mach = require('mach');
var config = require('../config');

var db = config.DB;
var tables = config.tables;

// moneyeyes
var H = require('../H');

function mockDb(){
    return Q
        .fcall(function(){
            return [{
                first_name:'jelle',
                last_name:'foo',
                email_address:'jelle@defekt.nl',
                ping_count: 123,
                credits: 5,
                ping_cost: 1.2,
                sms_cost: 1.4
            }];
        })
};

exports.Users = {
    list: function() {
        return db
            .newScanBuilder(tables.users)
            .execute()
            .then(_.property('result'))
            .then(H.map(
                function(user){
                    return {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        status: user.status,
                        email: user.email_address,
                        pings: user.ping_count,
                        credits: user.credits - (user.ping_cost + user.sms_cost)
                    };
                })
                .value()
            )
            .then(mach.json);
    },

    check_count: function(req, email_address) {
        return db
            .newQueryBuilder(tables.checks)
            .setHashKey('email_address', email_address)
            .selectAttributes(['enabled', 'frequency'])
            .execute()
            .then(_.property('result'))
            .then(H
                .reduce(function(accum, value){
                    var enabled = value.enabled || 0
                    accum.checks_enabled += enabled;
                    accum.checks_disabled += 1 - enabled;
                    accum.checks_total += 1;
                    accum.frequency += (1/value.frequency) || 0;
                    return accum;
                },{
                    checks_enabled: 0,
                    checks_disabled: 0,
                    checks_total: 0,
                    frequency: 0.0
                })
            )
            .then(mach.json);
    }
};

exports.Checks = {
    list: function(req, email_address) {
        return db
            .newQueryBuilder(tables.checks)
            .setHashKey('email_address', email_address)
//            .setRangeKey('enabled', 1)
            .execute()
            .then(_.property('result'))
            .then(H
                .map(function(check){
                    return {
                        name: check.name,
                        id: check.check_id,
                        enabled: check.enabled,
                        interval: check.frequency,
                        locations: check.locations,
                        nr_recent_ups: check.nr_recent_ups,
                        nr_recent_downs: check.nr_recent_downs,
                        last_down: check.recently_down_at,
                        state: check.state,
                        url: check.url
                    };
                })
                .value()
            )
            .then(mach.json);
    }
};