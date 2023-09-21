const expressPort = 3000;

const express = require("express");
const session = require("express-session");
const files = require("express-fileupload");
const {urlencoded, json} = require("body-parser");
const {join} = require("path");
const {generateRandomString} = require("./Source/Engines/UtilityEngine.js");

const app = express();
const websiteDirectory = join(__dirname, "Source/Website");

app.use("/assets", express.static(join(websiteDirectory, "assets")));
app.use("/UserImages", express.static(join(__dirname, "Source/UserImages")));
app.set("view engine", "ejs");
app.set("views", join(websiteDirectory, "views"));
app.use(urlencoded({ extended: false }));
app.use(files({createParentPath: true}));
app.use(json());
app.use(session({
    secret: "IncredibleMiracleSecretWow",
    resave: false,
    saveUninitialized: false, 
    cookie: {maxAge: 300000, httpOnly: true},
    rolling: true
}));

//app.listen(expressPort, () => console.log("Server successfully running!"));
app.listen(expressPort, () => console.log(`Server running! View the application at http://localhost:${expressPort}/`));

function serveView(webpageName, renderData=null, ...desiredMiddleware) {
    app.get(`/${webpageName}`, desiredMiddleware, function(request, response) {
        response.render(webpageName, {session: request.session, renderData: renderData});
    });
}

module.exports = {app, serveView, join};
