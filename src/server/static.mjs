import st from "st";
import http from "node:http";

const mount = st({ path: "./src", url: "/" });

http
  .createServer((req, res) => {
    const stHandled = mount(req, res);
    if (stHandled) return;
    else res.end("this is not a static file");
  })
  .listen(1338);
