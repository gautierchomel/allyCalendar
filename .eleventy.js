var momentz = require("moment-timezone");
// var config = require("./views/_data/config.json");



// markdown parser
let markdownIt = require("markdown-it");
let implicitFigures = require("markdown-it-implicit-figures");
let blockEmbedPlugin = require("markdown-it-block-embed");
let html5Embed = require("markdown-it-html5-embed");
let frame = require("markdown-it-iframe");
const fg = require('fast-glob');


module.exports = function (eleventyConfig) {
  // markdown

  let markdownLib = markdownIt({ html: true })
    .use(implicitFigures, {
      dataType: false, // <figure data-type="image">, default: false
      figcaption: false, // <figcaption>alternative text</figcaption>, default: false
      tabindex: true, // <figure tabindex="1+n">..., default: false
      link: true, // <a href="img.png"><img src="img.png"></a>, default: false
    })
    .use(frame)
    .use(blockEmbedPlugin, {
      containerClassName: "video-embed",
      outputPlayerSize: false,
    })
    .use(html5Embed, {
      html5embed: {
        useImageSyntax: true, // Enables video/audio embed with ![]() syntax (default)
        useLinkSyntax: true, // Enables video/audio embed with []() syntax
      },
    });

  eleventyConfig.setLibrary("md", markdownLib);

  eleventyConfig.addFilter("markdownify", (value) => markdownLib.render(value));

  // multi filter
  eleventyConfig.addFilter("where", function (array, key, value) {
    return array.filter((item) => {
      const keys = key.split(".");
      const reducedKey = keys.reduce((object, key) => {
        return object[key];
      }, item);

      return reducedKey === value ? item : false;
    });
  });


  // commms collection

  // Run search for images in /images/comms/ and /sponsors
  const comImages = fg.sync(['**/images/comms/*', '!**/temp', '!**/public',]);

  //Create collection of gallery images
  eleventyConfig.addCollection('commsImages', function (collection) {

    return comImages;
  });


  eleventyConfig.addFilter('replace', function (value, replace, replaceby) {
    return value = value.replace(replace, replaceby);
  })


  eleventyConfig.addFilter('toLowerCase', function (value) {
    return value = value.toLowerCase();
  })


  eleventyConfig.addFilter("separateServices", function (value) {
    let values = value.replace(/(\r\n\t|\n|\r\t)/gm, " ,").split(",");
    // console.log(values);
    let cleanSocialAccount = "";
    // dont do anything if the value is empty
    values.forEach(socialAccount => {
      if (socialAccount != "") {
        const name = socialAccount.split(": ");
        let link;
        if (name[0].toLowerCase() === "twitter") {
          link = `<a target="_blank" class="twitter" href="https://www.twitter.com/${name[1].replace('@', '')}/">${name[1]}</a>`;
        }
        else if (name[0].toLowerCase() === "instagram" || name[0].toLowerCase() === "ig") {
          link = `<a target="_blank" class="instagram" href="https://www.instagram.com/${name[1].replace('@', '')}/">${name[1]}</a>`;
        } else if (name[0].toLowerCase() === "linkedin") {
          link = `<a target="_blank" class="linkedin" href="${name[1]}">${name[1].replace('https://www.linkedin.com/in/', '')}</a>`;
        }
        else {
          link = name[1];
        }
        cleanSocialAccount += (name.length > 1) ? `<li><span class="service">${name[0]}</span> <span class="handler">${link}</span></li>` : "";
      }
    })
    return cleanSocialAccount;
  });

  eleventyConfig.addFilter("toUTC", function (date, timezone) {
    return momentz(`${date}`, timezone).utc().format();
  });

  // format date using moment
  eleventyConfig.addFilter(
    "formatDate",
    function (value, targetTimeZone = "UTC", format) {
      return momentz(value).tz(targetTimeZone).format(format);
    }
  );

  eleventyConfig.addFilter(
    "sortByID",
    function (value) {
      return value.sort(function (a, b) {
        return b.id - a.id;
      });
    }
  );



  // find offset between dates using moment: this was used to show empty dates between events, but it needs to be rewritten.
  eleventyConfig.addFilter("momentInterval", function (lastDate, firstDate) {
    const start = momentz(firstDate);
    const end = momentz(lastDate);
    let offset = end.diff(start, "days");
    let emptyDays = ``;
    let dayPassed = 0;
    while (dayPassed < offset) {
      emptyDays += `<ul class="day empty ${momentz(firstDate)
        .add(dayPassed + 1, "days")
        .format("dddd")}" id="day-${momentz(firstDate)
          .add(dayPassed + 1, "days")
          .format("DD")}"><h2><span class="day-letter">${momentz(firstDate)
            .add(dayPassed + 1, "days")
            .format("dddd")}</span> <span class="number">${momentz(firstDate)
              .add(dayPassed + 1, "days")
              .format("DD")}</span></h2></ul>`;
      dayPassed = dayPassed + 1;
    }
    return emptyDays;
  });

  // implementation for the split
  eleventyConfig.addFilter("splitter", function (value, sep = ",") {
    if (value.includes(sep)) {
      return value.split(sep);
    }
  });

  eleventyConfig.setTemplateFormats(["njk", "md"]);
  // trying to put things through snowpack and not eleventy
  // eleventyConfig.addPassthroughCopy({ "static/css": "/css" });
  eleventyConfig.addPassthroughCopy({ "static/data": "/data" });
  eleventyConfig.addPassthroughCopy({ "static/images": "/images" });
  eleventyConfig.addPassthroughCopy({ "static/fonts": "/fonts" });

  // ↓ taking care of in snowpack
  // eleventyConfig.addPassthroughCopy({ "static/js": "/js" });

  // ↓ taking care of in snowpack
  // eleventyConfig.addPassthroughCopy({ "static/css": "/css" });

  eleventyConfig.addFilter("bust", (url) => {
    let local = new Date();
    return `${url}?v=${local.getTime()}`;
  });

    // declare collections in 11ty
  eleventyConfig.addCollection("eventsMD", function (collection) {
    return collection
      .getFilteredByGlob("views/content/eventList/*.md")
      .sort(function (a, b) {
        return b.fullTime - a.fullTime;
      });
  });

  eleventyConfig.addCollection("peopleMD", function (collection) {
    return collection
      .getFilteredByGlob("views/content/peopleList/*.md")
      .sort(function (a, b) {
        return b.name - a.name;
      });
  });

  // 404 page local
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync("public/404.html");

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      },
    },
  });

  return {
    dir: {
      input: "views",
      output: "temp",
    },
    passthroughFileCopy: true,
  };
};



// filter for different services

