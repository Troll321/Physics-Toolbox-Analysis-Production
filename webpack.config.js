const path = require("path");

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./js/index.js",
    output: {
        filename: "main.js",
        path: path.join(__dirname, "dist"),
        clean: true
    },
};