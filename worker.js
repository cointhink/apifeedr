
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
    // another worker may have taken the job
    if(msg) {
      job = edn.parse(msg)
      work_job(job)
    }
  })
}

function work_job(job) {
  console.log('working '+job.at('id'))
  answer = { id: job.at('id'),
             result: [1,2,3]}
  redis.publish(job.at('id'), edn.encode(answer))
}

