const axios = require('axios');

class modelHandler {
  constructor(verb, url, payload, params) {
    this.verb = verb;
    this.url = url;
    this.payload = payload;
    this.params = params;
    this.calls = [];
  }

  prepareCalls() {
    let currCalls = []
    for (let i = 0; i < this.params.length; i++) {
      let url = this.url;
      let propsObj = this.params[i];
      for (const [key, value] of Object.entries(propsObj)) {
        url = url.replace(key, value)
      }
      currCalls.push({method: this.verb, url: url, data: this.payload})
    }
    this.calls = currCalls
  }

  preparePromise() {
    let currCalls = this.calls;
    let promiseCalls = []

    //create Promises
    for (let i = 0; i < currCalls.length; i++) {
      let promiseCall = axios({
        method: currCalls[i].method,
        url: currCalls[i].url,
        data: currCalls[i].data
      });
      promiseCalls.push(promiseCall)
    }
    this.callPromise = Promise.allSettled(promiseCalls);
  }
  
  async performActions() {
    this.prepareCalls();
    this.preparePromise();

    let numberOfCalls = this.calls.length;
    
    // initiate Promise
    var results = await this.callPromise;

    // check for rejected calls and store the call to do again later
    let doAgain = []
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === "rejected") {
        doAgain.push(this.calls[i])
      }
    }

    // store the calls to make again
    this.calls = doAgain;

    // initiate the rejected calls again - if there are some
    if (doAgain.length > 0) {
      this.preparePromise();
      var results = await this.callPromise;
    }

    let rejected = 0;
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === "rejected") {
        rejected++;
      }
    }
    this.summary = { numberOfCalls, rejected }
  }

  prepareResponse() {
    let response = {status: 200, data: {}};
    let { numberOfCalls, rejected } = this.summary;

    if (rejected > 0 && rejected < numberOfCalls) {
      response.data.success = numberOfCalls - rejected;
      response.data.failed = rejected;
      response.data.message = "Request was partially succeeded"
      response.status = 200;
    } else if (rejected === 0) {
      response.data.message = "Request was made successfully"
      response.status = 200;
    } else {
      response.status = 503
      response.data.message = "Request was failed"
    }

    this.response = response;
  }
}
module.exports = { modelHandler }