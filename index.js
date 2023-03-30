const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");
const { response } = require("express");
const { equal } = require("assert");
const { emit } = require("process");
const fs = require("fs");

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
    let success = request.query.success;
    if (success == "false") {
        response.render("login", { session: request.session, error: true });
    } else {
        response.render("login", { session: request.session, error: false });
    }
});

app.get("/signup", (request, response) => {
    let status = request.query.status;
    status = parseInt(status);
    response.render("signup", { session: request.session, status: status });
});

app.get("/p/:pid", (request, response) => {
    let pid = request.params.pid;
    const filepath = `content/${pid}.txt`;
    connection.query(
        "SELECT * FROM `pastes` WHERE `id` = ?",
        [pid],
        function (error, results, fields) {
            if (error) {
                response.render("pasteview", {
                    session: request.session,
                    error: "An unexpected error ocurred.",
                });
                return;
            }
            if (results.length > 0) {
                let content = "";
                try {
                    content = fs.readFileSync(filepath, "utf-8");
                } catch (error) {
                    // log here perhaps
                    response.render("pasteview", {
                        session: request.session,
                        error: "An unexpected error ocurred.",
                    });
                    return;
                }

                const title = results[0].title;

                response.render("pasteview", {
                    session: request.session,
                    error: false,
                    title: title,
                    content: content,
                });
            } else {
                response.render("pasteview", {
                    session: request.session,
                    error: "The paste doesn't exist.",
                });
                return;
            }
        }
    );
});

app.post("/register", (request, response) => {
    let username = request.body.username;
    let email = request.body.email;
    let password1 = request.body.password1;
    let password2 = request.body.password2;
    if (username && email && password1 && password2) {
        if (password1 != password2) {
            response.redirect("/signup?status=1");
            response.end();
        }
        connection.query(
            "INSERT into accounts (username, password, email) VALUES (?, ?, ?)",
            [username, password1, email],
            function (error, results, fields) {
                if (error) {
                    response.redirect("/signup?status=2");
                    response.end();
                    return;
                }
                response.redirect("/signup?status=3");
                response.end();
            }
        );
    } else {
        response.redirect("/signup?status=0");
        response.end();
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
        response.redirect("/login?success=false");
        response.end();
    }
});

app.listen(3000);
