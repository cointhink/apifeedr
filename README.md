# bouncy-job-queue

A nodejs and redis based job queue farming for the request/response pattern (notably
HTTP API calls).

# setup

$ git clone https://github.com/donpdonp/bouncy-job-queue.git
$ cd bouncy-job-queue
$ npm install
$ node main.js

$ node worker.js

$ curl -X POST -d '{"method":"dosomething"}' http://localhost:8000/api

