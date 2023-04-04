const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

const connection = mysql.createConnection({
    host: "localhost",
    user: "upaste",
    password: "password", // Use env variable
    database: "paste_app",
});

const logInfo = (request, functionName, message) => {
    process.stdout.write("Date: " + Date.now().toString() + " ");
    process.stdout.write("IP: " + request.headers["x-real-ip"] + " ");
    process.stdout.write("Host " + request.headers["host"] + " ");
    process.stdout.write("Function: " + functionName + " ");
    process.stdout.write("Message: " + message + "\n");
};

const logError = (request, functionName, message) => {
    process.stderr.write("Date: " + Date.now().toString() + " ");
    process.stderr.write("IP: " + request.headers["x-real-ip"] + " ");
    process.stderr.write("Host " + request.headers["host"] + " ");
    process.stderr.write("Function: " + functionName + " ");
    process.stderr.write("Message: " + message + "\n");
};

const app = express();

app.use(
    session({
        secret: "secret", // Use env variable
        resave: true,
        saveUninitialized: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

app.set("view engine", "ejs");

app.get("/", (request, response) => {
    logInfo(request, "index", "1 User");
    response.render("index", { session: request.session });
});

app.get("/login", (request, response) => {
    let success = request.query.success;
    if (success == "false") {
        logInfo(request, "login", "unsuccesfull login");
        response.render("login", { session: request.session, error: true });
    } else {
        logInfo(request, "login", "succesfull login");
        response.render("login", { session: request.session, error: false });
    }
});

app.get("/signup", (request, response) => {
    let status = request.query.status;
    status = parseInt(status);
    logInfo(request, "signup", "signup request");
    response.render("signup", { session: request.session, status: status });
});

app.get("/create", (request, response) => {
    if (!request.session.loggedin) {
        response.render("reminder", { session: request.session });
        return;
    }
    logInfo(request, "create", "new paste created");
    response.render("createpaste", { session: request.session });
});

app.get("/p/:pid", (request, response) => {
    let pid = request.params.pid;
    const filepath = `content/${pid}.txt`;
    connection.query(
        "SELECT * FROM `pastes` WHERE `stringid` = ?",
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
                logError(
                    request,
                    "pasteview",
                    `visualizing unexisting paste with pid: ${pid}`
                );
                response.render("pasteview", {
                    session: request.session,
                    error: "The paste doesn't exist.",
                });
                return;
            }
        }
    );
});

app.get("/mypastes", (request, response) => {
    if (!request.session.loggedin) {
        response.render("reminder", { session: request.session });
        return;
    }
    let pastes = null;
    connection.query(
        "SELECT * FROM `pastes` WHERE `owner` = ?",
        [request.session.username],
        (error, results, values) => {
            if (!error) {
                pastes = results;
                response.render("mypastes", {
                    session: request.session,
                    pastes: pastes,
                });
            } else {
                logError(request, "mypastes", "errorVisualizingMyPage");
                response.render("mypastes", {
                    session: request.session,
                    pastes: [],
                });
            }
        }
    );
});

app.get("/about", (request, response) => {
    response.render("about", { session: request.session });
});

app.get("/sponsors", (request, response) => {
    response.render("sponsors", { session: request.session });
});

app.get("/wiki", (request, response) => {
    response.render("wiki", { session: request.session });
});

app.get("/contact", (request, response) => {
    response.render("contact", { session: request.session });
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
            return;
        }
        connection.query(
            "INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)",
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
                    logError(
                        request,
                        "auth",
                        "WrongCredentialsForUser<" + username + ">"
                    );
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

app.post("/createpaste", (request, response) => {
    let title = request.body.title;
    let content = request.body.content;
    if (!title || title == "") title = "Untitled";
    if (!content || content == "") content = "(Empty)";

    connection.query(
        "INSERT INTO `pastes` (`stringid`, `title`, `owner`) SELECT LEFT(MD5(RAND()), 5), ?, ?",
        [title, request.session.username],
        (error, results, fields) => {
            if (error) {
                // something
                console.log(error);
                response.end();
                return;
            }
            connection.query(
                "SELECT * FROM `pastes` WHERE `id` = ?",
                [results.insertId],
                (error, results, fields) => {
                    fs.writeFileSync(
                        "content/" + results[0].stringid + ".txt",
                        content,
                        { encoding: "utf-8" }
                    );
                    response.redirect("/p/" + results[0].stringid);
                }
            );
        }
    );
});

app.listen(3000);
