var _ = require('lodash');

// load settings.json
var settings = require('./settings.json')['radar_api.30mhz.com'];

var Dynamite = require('dynamite')

exports.DB = new Dynamite.Client({
    region: settings.dynamodb.region,
    accessKeyId: settings.dynamodb.access_key,
    secretAccessKey: settings.dynamodb.secret_key,
    sslEnabled: true
});

exports.tables = {
    users: settings.dynamodb.users_table_name,
    checks: settings.dynamodb.checks_table_name
};
