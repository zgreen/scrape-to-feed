# scrape-to-feed

Serve feeds from scraped HTML.

## Install

`npm install scrape-to-feed`

## Usage

1. At the root of your project, create a `feeds` directory. This directory will contain exported modules for defining your feeds, one feed per file.

2. Add a feed. Here is an example, `./feeds/nyt-example-feed.js`:

```js
module.exports = {
  url: "https://www.nytimes.com/",
  handler: $ => [
    { title: "NYT example feed" },
    ...$(".story-heading")
      .toArray()
      .map(function(story) {
        const $story = $(story);
        return {
          item: {
            title: $story.text(),
            link: $story.find("a").attr("href")
          }
        };
      })
  ]
};
```

3. Create and serve your feeds:

```js
#!/usr/bin/env node
require("scrape-to-feed")();
```

4. Your feed will be available at: `localhost:3000/nyt-example-feed`

## Arguments

By default, all feeds will be re-scaped and rebuilt every hour. You can pass a custom interval, like so:

```js
require("scrape-to-feed")(1000 * 60 * 60 * 24); // Update feeds once per day.
```
