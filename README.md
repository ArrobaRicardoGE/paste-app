# Paste App

## Requirements

-   Node v14.18.0 or newest
-   MySQL v8.0.26 or newest
-   Install node dependencies listed in `package.json`

## Installation

### Database

1. Create database as root by running: `mysql -u root -p < database_gen.sql`
2. When prompted, write root's password

Database should now be ready.
> Make sure that MySQL is running in port 3306, otherwise, specify on connection in `index.js`

### Application

1. Create directories `content` and `logs` in the root of this application.
2. Run `node index.js` to start the application.
