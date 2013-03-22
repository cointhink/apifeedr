var redisLib = require("redis"),
    redis = redisLib.createClient();
var events = require('events')
var edn = require('jsedn');

module.exports = {
  setup: function(opts) {
    var redis_sub = redisLib.createClient()
    this.work_finisher = new events.EventEmitter()
    this.work_finisher.on('job_result', this.respond)

    // wait for job notices
    redis_sub.subscribe('qtick')
    redis_sub.on('message', function(channel, msg){
      console.log('got tick')
      work_jobs()
    })
  },

  work_jobs: function(jobber) {
    redis.llen('jobs', function(err,len){
      if (len > 0) {
        console.log(this)
        this.work_next_job(jobber)
        this.work_jobs(jobber)
      } else {
        console.log('jobs queue empty.')
      }
    })
  },

  work_next_job: function(jobber) {
    redis.lpop('jobs', function(err, msg){
      // another worker may have taken the job
      if(msg) {
        job = edn.parse(msg)
        this.work_job(job, jobber)
      }
    })
  },

  work_job: function(job, jobber) {
    console.log('working '+job.at('id'))
    jobber(job, finisher)
  },

  respond: function(result) {
    answer = { id: job.at('id'),
           result: result}
    redis.publish(job.at('id'), edn.encode(answer))
  }
}
