var workerLib = require('../lib/worker.js')
var events = require('events')

describe("apifeedr worker", function() {
  it("starts listening for jobs", function() {
    spyOn(workerLib, 'work_jobs')
    workerLib.work(function(){})
    expect(workerLib.work_jobs).toHaveBeenCalled()
  });

  it("handles the queue", function(){
    var finisher = new events.EventEmitter()
    spyOn(workerLib, 'work_next_job')
    workerLib.work_jobs(function(){}, finisher)
    // queue is always empty
  })
});

