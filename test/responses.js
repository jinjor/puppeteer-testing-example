module.exports = class Responses {
  constructor(topPage) {
    this.topPage = topPage;
    this.responses = {};
    this.notFound = undefined;
  }
  set404(response) {
    this.notFound = response;
  }
  add(method, path, response) {
    const key = `${method} ${path}`;
    this.responses[key] = response;
  }
  get(request) {
    const method = request.method();
    const url = request.url();
    const path = url.split(this.topPage)[1];
    const key = `${method} ${path}`;
    const response = this.responses[key];
    if (response === undefined) {
      if (this.notFound === undefined) {
        throw new Error("404 not specified");
      }
      return this.notFound;
    }
    return response;
  }
  reset() {
    delete this.notFound;
    for (let key in this.responses) {
      delete this.responses[key];
    }
  }
};
