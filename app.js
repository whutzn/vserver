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

routes(app);

module.exports = app;