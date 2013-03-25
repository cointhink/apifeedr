var workerLib = require('../lib/worker.js')

describe("apifeedr worker", function() {
  it("contains spec with an expectation", function() {
    spyOn(workerLib, 'work_jobs')
    workerLib.work(function(){})
    expect(workerLib.work_jobs).toHaveBeenCalled()
  });
});

