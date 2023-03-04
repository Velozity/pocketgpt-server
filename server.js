const express = require("express");
const next = require("next");
const port = process.env.PORT || 3000;
const dev = process.env.SERVER_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const server = express();

app.prepare().then(() => {
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(
      `> Ready on http://localhost:${port} (production: ${
        process.env.SERVER_ENV === "production"
      })`
    );
  });
});

module.exports = { server };
