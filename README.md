# bouncy-job-queue

A nodejs and redis based job queue farming for the request/response pattern (notably
HTTP API calls).

# setup

```
$ git clone https://github.com/donpdonp/bouncy-job-queue.git
$ cd bouncy-job-queue
$ npm install
```

Start the HTTP listener
```
$ node main.js
```

Start a worker
```
$ node worker.js
```

Start some work, using the JSON-RPC 2.0 format
```
$ curl -X POST -d '{"jsonrpc":"2.0","method":"dosomething"}' http://localhost:8000/api
```
