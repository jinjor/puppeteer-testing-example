const express = require("express");

module.exports = class Server {
  constructor() {
    this.app = express();
  }
  static(publicDir) {
    this.app.use(express.static(publicDir));
  }
  start(port) {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, () => {
        resolve();
      });
    });
  }
  close() {
    if (this.server !== undefined) {
      this.server.close();
    }
  }
};
