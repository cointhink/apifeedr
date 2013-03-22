var redisLib = require("redis");
var fs = require('fs');
var edn = require("jsedn");
var bouncy = require('bouncy');
var redisLib = require("redis");
var uuid = require('node-uuid');

apifeedr = { worker: {} }

apifeedr.worker.setup = function(opts) {
  var redis_sub = redisLib.createClient()

  // wait for job notices
  redis_sub.subscribe('qtick')
  redis_sub.on('message', function(channel, msg){
    work_jobs()
  })
}

apifeedr.worker.listen = function(cb) {
}

exports = module.exports = apifeedr