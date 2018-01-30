const fs = require("fs");

const axios = require("axios");
const cheerio = require("cheerio");
const jsToXML = require("jstoxml");
const app = require("express")();

const PORT = process.env.PORT || 3000;
let modules = {};
let feeds = {};

function createFeeds() {
  fs.readdir(`${process.cwd()}/feeds`, "utf8", (err, files) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    modules = files.reduce(
      (acc, file) => ({
        ...acc,
        [file]: require(`${process.cwd()}/feeds/${file}`)
      }),
      {}
    );
    const keys = Object.keys(modules);
    keys.forEach(key => {
      const { url, handler } = modules[key];
      axios(url).then(({ data }) => {
        feeds = {
          ...feeds,
          [key.slice(0, -3)]: jsToXML.toXML(
            {
              _name: "rss",
              _attrs: {
                version: "2.0"
              },
              _content: {
                channel: handler(cheerio.load(data))
              }
            },
            { header: true, indent: "  " }
          )
        };
        if (Object.keys(feeds).length === keys.length) {
          Object.keys(feeds).forEach((feedKey, idx) => {
            app.get(`/${feedKey}`, (req, res) => {
              res.send(feeds[feedKey]);
            });
          });
        }
      });
    });
  });
}

module.exports = (interval = 1000 * 60 * 60) => {
  app.listen(PORT, () => {
    console.log(`scrape-to-feed listening on port ${PORT}!`);
    createFeeds();
    setInterval(() => {
      createFeeds();
    }, interval);
  });
};
