// const data = require("./views/_data/config.json");
// const theme = data.theme;
// 

module.exports = {
  mount: {
    temp: { url: "/", static: true },
    "static/js": { url: "/js" },
    "static/css": { url: "/css" },
  },
  plugins: [
    "@snowpack/plugin-postcss",
    // ["@snowpack/plugin-webpack"],
    [
      "@snowpack/plugin-run-script",
      {
        cmd: "eleventy",
        watch: "$1 --watch",
      }
    ],
  ],
  packageOptions: {
    NODE_ENV: true,
  },
  buildOptions: {
    clean: false,
    out: "public",
  },
  devOptions: {
    open: "none",
  },
  optimize: {
    bundle: true,
    minify: true,
    target: 'es2020' | 'es2019' | 'es2018' | 'es2017',
    HMR: 3000,
    
  },
};
