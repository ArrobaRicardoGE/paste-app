# Paste App

## Requirements

-   Node v14.18.0 or newest
-   MySQL v8.0.26 or newest
-   Install node dependencies listed in `package.json`

## Installation

### Database

1. Create database as root by running: `mysql -u root -p < database_gen.sql`
2. Log in as root, and create user "upaste", identified by password "password": `mysql> CREATE USER 'upaste'@'%' IDENTIFIED BY 'password';`
3. Grant all permissions to the paste_app database to the new user: `mysql> GRANT ALL PRIVILEGES ON paste_app.* TO 'upaste'@'%' WITH GRANT OPTION;`
4. Flush privileges: `mysql> FLUSH PRIVILEGES;`

### Application

Run `node index.js` to start the application.
