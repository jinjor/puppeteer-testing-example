const express = require("express");

let server;
module.exports.start = function(dir, port) {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(express.static(dir));
    server = app.listen(port, () => {
      resolve();
    });
  });
};
module.exports.close = function() {
  if (server) {
    server.close();
  }
};
