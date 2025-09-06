require('dotenv').config();

const mysql = require('mysql2');

// Ensure the port is explicitly set
const db = mysql.createConnection({
    host: process.env.DB_HOST,  // '127.0.0.1'
    user: process.env.DB_USER,  // 'root'
    password: process.env.DB_PASSWORD,  // ''
    database: process.env.DB_NAME,  // 'coa3'
    port: process.env.DB_PORT || 3307  // Fallback to 3307 if DB_PORT is not set
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database on port', process.env.DB_PORT);
});

module.exports = db;
