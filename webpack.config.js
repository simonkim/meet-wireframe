var DIST_DIR = __dirname + "/public/dist"
var APP_DIR = __dirname + "/app"

module.exports = {
    context: APP_DIR,
    entry: "./meet-wireframe.js",
    output: {
        path: DIST_DIR,
        filename: "wfmeet.js",
        library: "WFMeet"
    },
    module: {
        loaders: [
            {
                test: /\.js?/,
                include: APP_DIR,
                loader: 'babel'
            }
        ]
    }
}

