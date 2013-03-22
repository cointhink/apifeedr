# apifeedr

A nodejs and redis based job farming library for the request/response pattern (notably
HTTP API calls).

# overview

It became apparent that a request into an api needed to be
its own object/concept in the system. Something persistent so it could be
managed and logged.

The nodejs 'bouncy' library answers http requests. The body of the request
is parsed from json-rpc into an API call and put into a redis list. A redis
pub/sub channel notifies the workers of a new job. Another pub/sub channel
is setup with the job id to receive the reply from whichever worker ends
up with the job.

When the bouncy http request/response cycle receives the result, it sends
the result in the HTTP response.

The goal is to easily support multiple workers that could be taken online
and offline with minimal interruption of the API service. Redis provides
the atomicity of pulling jobs off the queue.

# setup

```
$ git clone https://github.com/cointhink/apifeedr.git
$ cd apifeedr
$ npm install
```

Start the HTTP listener (at the web head)
```
$ cat main.js
apiqueue = require('apifeedr').queue
apiqueue.setup().listen(8000)

$ node main.js
```

Start worker(s) (possibly on multiple boxes)
```
$ cat worker.js
apiworker = require('apifeedr').worker
apiworker.work((job_info, finisher)->
  local_api_process.fire(job_info.msg, function(result){
    finisher.emit('job_result', String(result))
  })
)

$ node worker.js
```

Start some work, using the JSON-RPC 2.0 format
```
$ curl -X POST -d '{"jsonrpc":"2.0","method":"dosomething"}' http://localhost:8000/api
{ "jsonrpc":"2.0", "id":"aa62343b-9f77-4c4c-b5b8-dbee1d910849", "result":[1,2,3] }
```
