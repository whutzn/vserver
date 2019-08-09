let express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    expressValidator = require("express-validator"),
    connection = require("express-myconnection"),
    mysql = require("mysql"),
    cors = require("cors"),
    routes = require("./routes"),
    config = require("./config"),
    logger = require("morgan"),
    ffmpeg = require("ffmpeg"),
    app = express();

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(connection(mysql, config.getDbConfig(), "request"));

app.get("/", function(req, res) {
    res.send("video server");
});

//获取视频缩略图
function getVideoSceenshots(videoPath, outPutPath, frameRate, frameCount) {
    const process = new ffmpeg(videoPath);
    return process.then(function(video) {
        video.fnExtractFrameToJPG(outPutPath, {
            frame_rate: frameRate,
            number: frameCount,
            file_name: 'my_frame_%t_%s'
        }, function(error, files) {
            if (!error)
                console.log('Frames: ' + files)
        })
    }, function(err) {
        console.log('Error: ' + err)
    })
}

const videoPath = './public/upload/002.mp4';
const outputPath = './public/';
getVideoSceenshots(videoPath, outputPath, 1, 5)

routes(app);

module.exports = app;