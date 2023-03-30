const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");

const connection = mysql.createConnection({
    host: "localhost",
    user: "upaste",
    password: "password",
    database: "paste_app",
});

const app = express();

app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

app.set("view engine", "ejs");

app.get("/", (request, response) => {
    response.render("index", { session: request.session });
});

app.get("/login", (request, response) => {
    var success = request.query.success;
    if (success == "false") {
        response.render("login", { session: request.session, error: true });
    } else {
        response.render("login", { session: request.session, error: false });
    }
});

// http://localhost:3000/auth
app.post("/auth", function (request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query(
            "SELECT * FROM accounts WHERE username = ? AND password = ?",
            [username, password],
            function (error, results, fields) {
                // If there is an issue with the query, output the error
                if (error) throw error;
                // If the account exists
                if (results.length > 0) {
                    // Authenticate the user
                    request.session.loggedin = true;
                    request.session.username = username;
                    // Redirect to home page
                    response.redirect("/");
                } else {
                    response.redirect("/login?success=false");
                }
                response.end();
            }
        );
    } else {
        response.send("Please enter Username and Password!");
        response.end();
    }
});

app.listen(3000);
