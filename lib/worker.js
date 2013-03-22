var redisLib = require("redis"),
    redis = redisLib.createClient();
var events = require('events')
var edn = require('jsedn');

exports = module.exports = {
  work: function(jobber, opts) {
    var redis_sub = redisLib.createClient()
    finisher = new events.EventEmitter()
    finisher.on('job_result', this.respond)

    // wait for job notices
    redis_sub.on('message', function(channel, msg){
      console.log('got tick')
      exports.work_jobs(jobber, finisher)
    })
    redis_sub.subscribe('qtick')
    this.work_jobs(jobber, finisher)
  },

  work_jobs: function(jobber, finisher) {
    redis.llen('jobs', function(err,len){
      if (len > 0) {
        exports.work_next_job(jobber, finisher)
        exports.work_jobs(jobber, finisher) // recursive iteration
      } else {
        console.log('jobs queue empty.')
      }
    })
  },

  work_next_job: function(jobber, finisher) {
    redis.lpop('jobs', function(err, msg){
      // another worker may have taken the job
      if(msg) {
        job = edn.parse(msg)
        exports.work_job(job, jobber, finisher)
      } else {
        console.log('work_next_job missed the boat')
      }
    })
  },

  work_job: function(job, jobber, finisher) {
    console.log('working '+job.at('id'))
    jobber(job, finisher)
  },

  respond: function(result) {
    answer = {     id: job.at('id'),
               result: edn.parse(result) }
    redis.publish(job.at('id'), edn.encode(answer))
  }
}
