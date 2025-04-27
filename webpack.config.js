const path = require("path")
const webpack = require("webpack")

module.exports = {
  mode: "production",
  entry: "./src/browser.ts",
  output: {
    filename: "browser.js",
    path: path.resolve(__dirname, "dist"),
    library: {
      name: "NodePDFLib",
      type: "umd",
      export: "default",
    },
    globalObject: "this",
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      fs: false,
      path: false,
      zlib: require.resolve("browserify-zlib"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
}
