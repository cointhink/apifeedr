var redisLib = require("redis");
var fs = require('fs');
var edn = require("jsedn");
var bouncy = require('bouncy');
var redisLib = require("redis");
var uuid = require('node-uuid');
var worker = require('./lib/worker')
var queue = {}//require('./lib/queue')

apifeedr = { worker: worker,
             queue: queue }

exports = module.exports = apifeedr
