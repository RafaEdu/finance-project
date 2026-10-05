const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve("dist");
const types = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
};
http
  .createServer((request, response) => {
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
    } catch {
      response.writeHead(400).end();
      return;
    }
    const target = path.resolve(root, "." + pathname);
    if (target !== root && !target.startsWith(root + path.sep)) {
      response.writeHead(403).end();
      return;
    }
    const file = target === root ? path.join(root, "index.html") : target;
    fs.readFile(file, (error, data) => {
      if (error) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
      });
      response.end(data);
    });
  })
  .listen(4173, "127.0.0.1");
