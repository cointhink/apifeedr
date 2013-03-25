var workerLib = require('../lib/worker.js')
var events = require('events')

describe("apifeedr worker", function() {
  it("contains spec with an expectation", function() {
    spyOn(workerLib, 'work_jobs')
    workerLib.work(function(){})
    expect(workerLib.work_jobs).toHaveBeenCalled()
  });

  it("handles a job", function(){
    var finisher = new events.EventEmitter()
    spyOn(workerLib, 'work_next_job')
    workerLib.work_jobs(function(){}, finisher)
    // nothing to test?
  })
});

