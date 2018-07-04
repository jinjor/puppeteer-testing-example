const Server = require("./server");
const server = new Server();
server.static(`${__dirname}/../public`);
server.start(3000).catch(e => {
  console.log(e);
  exit(1);
});
