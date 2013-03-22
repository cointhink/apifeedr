var worker = require('./lib/worker')
var queue = require('./lib/queue')

apifeedr = { worker: worker,
             queue: queue }

module.exports = apifeedr

