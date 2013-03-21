# bouncy-job-queue

A nodejs and redis based job queue farming for the request/response pattern (notably
HTTP API calls).

# overview

At some point it became apparent that a request into an api needed to be
its own object/concept in the system. Something persistent so it could be
managed and logged.

The nodejs 'bouncy' library answers http requests. The body of the request
is parsed into an API call and put into a redis list. A redis pub/sub channel
is notified of the new job. Another pub/sub channel is setup with the job id
to receive the reply.

Worker processes listen to the job annoucement channel, and pull a job off the
list for processing. Once the result of the processing is obtained, the result
is pushed into the pub/sub channel setup for that job.

When the bouncy http request/response cycle receives the result, it sends
the result in the HTTP response.

The goal is to easily support multiple workers that could be taken online
and offline with minimal interruption of the API service. Redis provides
the atomicity of pulling jobs off the queue.

# setup

```
$ git clone https://github.com/donpdonp/bouncy-job-queue.git
$ cd bouncy-job-queue
$ npm install
```

Start the HTTP listener (at the web head)
```
$ node main.js
```

Start worker(s) (possibly on other boxes)
```
$ node worker.js
```

Start some work, using the JSON-RPC 2.0 format
```
$ curl -X POST -d '{"jsonrpc":"2.0","method":"dosomething"}' http://localhost:8000/api
{ "values":[1,2,3] }
```
