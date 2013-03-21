var fs = require('fs');
var edn = require("jsedn");
var bouncy = require('bouncy');

var redisLib = require("redis"),
    system_redis = redisLib.createClient();

var uuid = require('node-uuid');

var settings = edn.parse(fs.readFileSync('settings.edn', 'utf8'))

var server = bouncy(function (req, res, bounce) {
  if (req.method == 'POST') {
    request_body_read(req, function(body) {
      var job = build_job(body)
      if (job) {
        farm_out(job, function(response_msg){
          respond(response_msg, res)
        })
      } else {
        error_respond(res)
      }
    })
  }
})

function request_body_read(req, cb) {
  var body = ""
  req.on('data', function(data){
    body += String(data)
  })
  req.on('end', function(){
    cb(body)
  })
}

function build_job(body) {
  try {
    msg = JSON.parse(body)
    var id = uuid.v4()
    var job = { id: id,
                method: msg.method,
                params: []
              }
    if (msg.params) { job.params = msg.params }
    return job
  } catch(e) {
    console.log("bad json "+body)
  }
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
  result = { jsonrpc: "2.0",
             id: answer.at('id'),
             result: edn.toJS(answer.at('result'))}
  response = JSON.stringify(result)
  console.log('responding: '+response)
  res.statusCode = 200;
  res.end(response);
}

function error_respond(res){
  result = { error: "error"}
  response = JSON.stringify(result)
  res.statusCode = 200;
  res.end(response);
}

console.log("Listening on "+settings.at('listen_port'))
server.listen(settings.at('listen_port'));
