var edn = require("jsedn");
var redisLib = require("redis"),
    redis_sub = redisLib.createClient(),
    redis = redisLib.createClient()

function work_jobs() {
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
    job = edn.parse(msg)
    work_job(job)
  })
}

function work_job(job) {
  console.log('working '+job.at('id'))
  answer = { id: job.at('id'),
             values: [1,2,3]}
  redis.publish(job.at('id'), edn.encode(answer))
}

// see if there is something ready
work_jobs()

// wait for job notices
redis_sub.subscribe('qtick')
redis_sub.on('message', function(channel, msg){
  work_jobs()
})
