var edn = require("jsedn");
var bouncy = require('bouncy');

var redisLib = require("redis"),
    system_redis = redisLib.createClient();

var uuid = require('node-uuid');

var server = bouncy(function (req, res, bounce) {
  if (req.method == 'POST') {
    if (req.url == '/api') {
      http_read(req, function(rpc) {
        var job = build_job(rpc)
        farm_out(job, function(response_msg){
          respond(response_msg, res)
        })
      })
    }
  }
})

function http_read(req, cb) {
  var msg = ""
  req.on('data', function(d){
    msg += String(d)
  })
  req.on('end', function(){
    cb(JSON.parse(msg))
  })
}

function build_job(rpc) {
  var id = uuid.v4()
  job = { id: id,
          method: rpc.method}
  return job
}

function farm_out(job, cb){
  var redis = redisLib.createClient();
  redis.subscribe(job.id)
  redis.on('subscribe', function(channel){
    publish(job)
  })
  redis.on('message', function(channel, msg){
    cb(msg)
    redis.end()
  })
}

function publish(job){
  job_msg = edn.encode(job)
  console.log('farming '+job_msg)
  system_redis.rpush('jobs', job_msg)
  // Announce job availability
  system_redis.publish('qtick', 'next')
}

function respond(response_msg, res){
  answer = edn.parse(response_msg)
  response = JSON.stringify(edn.toJS(answer))
  console.log('responding: '+response)
  res.statusCode = 200;
  res.end(response);
}
server.listen(8000);
