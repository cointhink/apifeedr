var queue = require('../lib/queue.js')

describe("apifeedr queue", function() {
  it("contains spec with an expectation", function() {
    var setup = queue.setup()
    expect(typeof(setup)).toBe('object');
  });
});

