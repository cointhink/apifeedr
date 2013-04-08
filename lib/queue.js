var fs = require('fs');
var edn = require("jsedn");
var bouncy = require('bouncy');

var redisLib = require("redis"),
    system_redis = redisLib.createClient();

var uuid = require('node-uuid');

exports = module.exports = {
  setup: function(){
    return bouncy(function (req, res, bounce) {
      console.log(req.method+" "+req.url)
      if (req.method == 'OPTIONS') {
        if(req.headers['access-control-request-method']) {
          exports.cors_respond(res, req.headers)
        }
      }
      else if (req.method == 'POST') {
        exports.request_body_read(req, function(body) {
          var job = exports.build_job(body)
          if (job) {
            exports.farm_out(job, function(response_msg){
              exports.respond(response_msg, res)
            })
          } else {
            exports.error_respond(res)
          }
        })
      }
    })
  },

  request_body_read: function(req, cb) {
    var body = ""
    req.on('data', function(data){
      body += String(data)
    })
    req.on('end', function(){
      cb(body)
    })
  },

  build_job: function(body) {
    try {
      msg = JSON.parse(body)
      var id = uuid.v4()
      var job = { id: id,
                  method: msg.method,
                  params: {}
                }
      if (msg.params) { job.params = msg.params }
      return job
    } catch(e) {
      console.log("bad json "+body)
    }
  },

  farm_out: function(job, cb){
    var redis = redisLib.createClient();
    redis.subscribe(job.id)
    redis.on('subscribe', function(channel){
      exports.publish(job)
    })
    redis.on('message', function(channel, msg){
      cb(msg)
      redis.end()
    })
  },

  publish: function(job){
    job_msg = edn.encode(job)
    console.log('farming '+job_msg)
    system_redis.rpush('jobs', job_msg)
    // Announce job availability
    system_redis.publish('qtick', 'next')
  },

  respond: function(response_msg, res){
    answer = edn.parse(response_msg)
    result = { jsonrpc: "2.0",
               id: answer.at('id'),
               result: edn.toJS(answer.at('result'))}
    response = JSON.stringify(result)
    console.log('responding: '+response)
    res.statusCode = 200;
    res.end(response);
  },

  error_respond: function(res){
    result = { error: "error"}
    response = JSON.stringify(result)
    res.statusCode = 200;
    res.end(response);
  },

  cors_respond: function(res, headers){
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', headers['origin'])
    res.setHeader('Access-Control-Allow-Methods', headers['access-control-request-method'])
    res.setHeader('Access-Control-Allow-Headers', headers['access-control-request-headers'])
    res.end();
  }
}
