module.exports = class Accesses {
  constructor(topPage) {
    this.topPage = topPage;
    this.accesses = {};
  }
  add(request) {
    const method = request.method();
    const url = request.url();
    const path = url.split(this.topPage)[1];
    const key = `${method} ${path}`;
    const body = JSON.parse(request.postData() || "{}");
    this.accesses[key] = {
      params: {},
      query: {},
      body: body
    };
  }
  get(method, path) {
    const key = `${method} ${path}`;
    return this.accesses[key];
  }
  reset() {
    for (let key in this.accesses) {
      delete this.accesses[key];
    }
  }
};
