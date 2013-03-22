var redisLib = require("redis"),
    redis = redisLib.createClient();
var events = require('events')
var edn = require('jsedn');

exports.setup = function(opts) {
    var redis_sub = redisLib.createClient()
    var work_finisher = new events.EventEmitter()

    // wait for job notices
    redis_sub.subscribe('qtick')
    redis_sub.on('message', function(channel, msg){
      work_jobs()
    })
  }

exports.work_jobs = function() {
    redis.llen('jobs', function(err,len){
      if (len > 0) {
        work_next_job()
        work_jobs()
      } else {
        console.log('jobs queue empty.')
      }
    })
  }

  function work_next_job() {
    redis.lpop('jobs', function(err, msg){
      // another worker may have taken the job
      if(msg) {
        job = edn.parse(msg)
        work_job(job)
      }
    })
  }

  function work_job(job) {
    console.log('working '+job.at('id'))
    result = this.dispatch(job)
    answer = { id: job.at('id'),
               result: [1,2,3]}
    redis.publish(job.at('id'), edn.encode(answer))
  }

