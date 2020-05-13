const http = require("http");
const server = http.createServer((request, response) => {
  console.log("收到请求");
  console.log(request.headers);

  response.setHeader("Content-Type", "text/html");
  response.setHeader("X-Foo", "bar");
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("ok");
});
server.listen(8080);
